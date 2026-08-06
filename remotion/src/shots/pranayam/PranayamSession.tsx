import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, Audio, Sequence, staticFile } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import CircularTimer from './CircularTimer';
import BreathingPhasePanel from './BreathingPhasePanel';
import PranayamCard from './PranayamCard';
import RestCard from './RestCard';
import NextRestPreview from './NextRestPreview';
import BreathAffirmationCard from './BreathAffirmationCard';
import BandhaDiagram from './BandhaDiagram';
import ShanmukhiMudraDiagram from './ShanmukhiMudraDiagram';
import SessionOverviewCard from './SessionOverviewCard';
import SparkleParticlesOverlay from '../brand/SparkleParticlesOverlay';
import PromoEndCard from '../brand/PromoEndCard';
import PeriodicLikeBanner, { likeBannerOpacity } from '../brand/PeriodicLikeBanner';
import TechniqueCompleteCard from './TechniqueCompleteCard';
import SessionSummaryCard from './SessionSummaryCard';
import TechniqueTransition from './TechniqueTransition';
import {
  PranayamType, PranayamLevel, cycleSeconds, roundSeconds, breathingSeconds,
  totalReps, resolveBreath, repsPerRound, PRACTICE_SEC_BY_LEVEL,
} from './breathPattern';
import {
  REST_SEC, VOICE_WINDOW_SEC, CELEBRATE_SEC, SUMMARY_SEC, TRANSITION_SEC, buildTimeline,
} from './sessionTimeline';

// The master timeline lives in sessionTimeline.ts (plain TS) so the chapter list and
// the subtitle file can be generated from the same numbers this composition uses.

/**
 * Congratulation flash after each technique. Counts and units come straight from the
 * specs, so they can never drift from what the viewer actually just did.
 */
/**
 * Breathing audio sits UNDER the practice, not over it — it is a rhythm reference for
 * closed eyes, so anything loud enough to notice as a sound is too loud. Kept per
 * technique because they are not equally intrusive: the forceful ones are the most
 * fatiguing over five minutes, while the Bhramari hum is the technique itself and
 * needs to stay audible enough to match your own humming to.
 */
/**
 * Shared body of BOTH pranayam sessions. It renders itself entirely from the level's
 * protocol set and timeline, so beginner and intermediate differ only in numbers —
 * there is no second implementation of the ring, the counters or the cue scheduling.
 *
 * The two compositions are thin wrappers: Daily5PranayamBeginner.tsx and
 * Daily5PranayamIntermediate.tsx.
 */

/**
 * Shortest phase that can hold a spoken cue. The single-word clips run about two
 * seconds at the session's slowed speaking rate, so anything shorter gets truncated
 * mid-word rather than guiding anyone.
 */
const PHASE_CUE_MIN_SEC = 2;

/**
 * Measured length of every spoken clip, from ffprobe. The scheduler needs to know how
 * long a cue actually talks for — guessing is what let three voices stack up at the
 * round boundary. Re-measure if gen_pranayam_voice.py changes the voice or the rate.
 */
const VOICE_CLIP_SEC: Record<string, number> = {
  'cue_inhale.mp3': 2.14,
  'cue_exhale.mp3': 2.14,
  'cue_hold.mp3': 1.92,
  'cue_rest.mp3': 1.99,
  'cue_exhale_rest.mp3': 3.12,
  'cue_inhale_left.mp3': 2.93,
  'cue_exhale_right.mp3': 2.88,
  'cue_inhale_right.mp3': 2.88,
  'cue_exhale_left.mp3': 2.86,
  'affirmation_inhale.mp3': 4.51,
  'affirmation_exhale.mp3': 4.94,
};

/** Silence left between one cue finishing and the next being allowed to start. */
const CUE_GAP_SEC = 0.2;

/** Cues at or above this priority are guaranteed to play. */
const STRUCTURAL_PRIORITY = 4;

/**
 * Resolve planned cues into a set that never talks over itself.
 *
 * Booked in TWO TIERS, because plain earliest-first was silently eating the important
 * ones: the last hold cue of an Anulom round ran 0.27s past the round end and blocked
 * "Rest" entirely, and the same happened to Bhastrika's rest call.
 *
 *   Tier 1 — structural cues (the closing retention sequence and the rest call) are
 *            booked first and always play. They mark where you are in the practice.
 *   Tier 2 — per-breath cues fill whatever gaps remain. Missing one costs nothing;
 *            the ring is still showing the phase.
 *
 * Dropping rather than delaying is deliberate: a phase cue spoken late is wrong
 * guidance, worse than no cue at all.
 */
function scheduleCues<T extends { at: number; file: string; priority: number }>(planned: T[]): T[] {
  const span = (c: T): [number, number] => {
    const len = (VOICE_CLIP_SEC[c.file] ?? 3) + CUE_GAP_SEC;
    return [c.at, c.at + len];
  };
  const byTime = (a: T, b: T) => a.at - b.at;

  const kept: T[] = [];
  const booked: Array<[number, number]> = [];
  const book = (c: T) => {
    kept.push(c);
    booked.push(span(c));
  };
  const clashes = ([s, e]: [number, number]) =>
    booked.some(([bs, be]) => s < be && e > bs);

  for (const cue of planned.filter((c) => c.priority >= STRUCTURAL_PRIORITY).sort(byTime)) {
    if (!clashes(span(cue))) book(cue);
  }
  for (const cue of planned.filter((c) => c.priority < STRUCTURAL_PRIORITY).sort(byTime)) {
    if (!clashes(span(cue))) book(cue);
  }

  return kept.sort(byTime);
}

const BREATH_VOLUME: Record<PranayamType, number> = {
  bhastrika: 0.08,
  kapalbhati: 0.14,
  anulom_vilom: 0.16,
  bahya: 0.16,
  bhramari: 0.30,
};

/** One round of breathing audio per technique, generated by gen_pranayam_sfx.py. */
const BREATH_TRACKS: Record<PranayamType, string> = {
  bhastrika: 'bhastrika_round.mp3',
  kapalbhati: 'kapalbhati_round.mp3',
  anulom_vilom: 'anulom_round.mp3',
  bahya: 'bahya_round.mp3',
  bhramari: 'bhramari_round.mp3',
};

export const PranayamSession: React.FC<{ level?: PranayamLevel }> = ({ level = 'beginner' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Everything below reads from the level's own timeline and protocol set. These shadow
  // the module-level beginner exports deliberately, so the same body serves both videos.
  const TL = buildTimeline(level);
  const PRANAYAM_SPECS = TL.specs;
  const {
    T_BHASTRIKA, T_CELEB_1, T_REST_1, T_KAPALBHATI, T_CELEB_2, T_REST_2,
    T_ANULOM, T_CELEB_3, T_REST_3, T_BAHYA, T_CELEB_4, T_REST_4,
    T_BHRAMARI, T_FINALE, T_SUMMARY, T_PROMO,
  } = TL;
  const INTRO_SEC = TL.introSec;
  const CELEBRATIONS = TL.techniques.map((t) => ({
    at: t.celebrateSec, type: t.type, index: t.index, title: t.title,
    isFinal: t.index === TL.techniques.length,
  }));

  /** Minutes of practice per technique at this level — shown on the card badge. */
  const practiceMinutes = Math.round(PRACTICE_SEC_BY_LEVEL[level] / 60);

  /** Intermediate keeps its own narration and breath tracks in a subfolder. */
  const audio = (file: string) =>
    `library/audio/pranayam/${level === 'intermediate' ? 'intermediate/' : ''}${file}`;

  const isIntro       = currentTime < INTRO_SEC;
  const isBhastrika   = currentTime >= T_BHASTRIKA  && currentTime < T_CELEB_1;
  const isRest1       = currentTime >= T_REST_1     && currentTime < T_KAPALBHATI;
  const isKapalbhati  = currentTime >= T_KAPALBHATI && currentTime < T_CELEB_2;
  const isRest2       = currentTime >= T_REST_2     && currentTime < T_ANULOM;
  const isAnulomVilom = currentTime >= T_ANULOM     && currentTime < T_CELEB_3;
  const isRest3       = currentTime >= T_REST_3     && currentTime < T_BAHYA;
  const isBahya       = currentTime >= T_BAHYA      && currentTime < T_CELEB_4;
  const isRest4       = currentTime >= T_REST_4     && currentTime < T_BHRAMARI;
  const isBhramari    = currentTime >= T_BHRAMARI   && currentTime < T_FINALE;
  const isEndPromo    = currentTime >= T_PROMO;

  let currentType: PranayamType = 'bhastrika';
  if (isKapalbhati) currentType = 'kapalbhati';
  else if (isAnulomVilom) currentType = 'anulom_vilom';
  else if (isBahya) currentType = 'bahya';
  else if (isBhramari) currentType = 'bhramari';

  const isResting = isRest1 || isRest2 || isRest3 || isRest4;
  const isActiveTechnique = isBhastrika || isKapalbhati || isAnulomVilom || isBahya || isBhramari;

  // Time left in the whole session — reaches 00:00 when the last technique ends,
  // not when the promo ends.
  const sessionLeftSec = Math.max(0, Math.ceil(T_FINALE - currentTime));
  const sessionTimeLeft = `${String(Math.floor(sessionLeftSec / 60)).padStart(2, '0')}:${String(sessionLeftSec % 60).padStart(2, '0')}`;
  const sessionProgress = Math.min(1, Math.max(0, currentTime / T_FINALE));
  const bannerOpacity = isIntro ? 0 : likeBannerOpacity(currentTime, T_FINALE);

  const currentStartSec = isKapalbhati ? T_KAPALBHATI
    : isAnulomVilom ? T_ANULOM
    : isBahya ? T_BAHYA
    : isBhramari ? T_BHRAMARI
    : T_BHASTRIKA;

  // Live breath state for STROKE + ROUND badges above the timer
  const breathState = isActiveTechnique
    ? resolveBreath(PRANAYAM_SPECS[currentType], currentTime - currentStartSec)
    : null;

  // True while the spoken instruction is still playing, before breathing begins.
  const inLeadIn = isActiveTechnique
    && currentTime < currentStartSec + PRANAYAM_SPECS[currentType].leadInSec;

  return (
    <AbsoluteFill style={{ backgroundColor: '#f5ebe0', overflow: 'hidden' }}>
      {/* End Promotional Slides */}
      {isEndPromo && <PromoEndCard startSec={T_PROMO} />}
      {/* Congratulation flash + chime at the end of each technique. */}
      {CELEBRATIONS.map((c) => {
        if (currentTime < c.at || currentTime >= c.at + CELEBRATE_SEC) return null;
        const spec = PRANAYAM_SPECS[c.type];
        return (
          <React.Fragment key={c.type}>
            <Sequence from={Math.round(c.at * fps)} durationInFrames={Math.round(CELEBRATE_SEC * fps)}>
              {/* Rising bell figure for finishing a technique, with the bowl under it. */}
              <Audio src={staticFile(audio('congratulations.mp3'))} volume={0.42} />
              <Audio src={staticFile(audio('completion_chime.mp3'))} volume={0.28} />
            </Sequence>
            <TechniqueCompleteCard
              startSec={c.at}
              durationSec={CELEBRATE_SEC}
              index={c.index}
              total={CELEBRATIONS.length}
              title={c.title}
              count={totalReps(spec)}
              unit={`${spec.repUnit}S`}
              isFinal={c.isFinal}
            />
          </React.Fragment>
        );
      })}
      {/* Whole-session tally, between the last congratulation and the course promo. */}
      {currentTime >= T_SUMMARY && currentTime < T_PROMO && (
        <SessionSummaryCard startSec={T_SUMMARY} durationSec={SUMMARY_SEC} level={level} />
      )}

      {/* --- SESSION SOUNDS ---
          Deliberately quiet. These punctuate a practice whose whole point is silence,
          so they mark a moment and get out of the way rather than announcing themselves. */}

      {/* Tingsha opens the session and marks each technique change. */}
      <Sequence from={0} durationInFrames={Math.round(8 * fps)}>
        <Audio src={staticFile(audio('tingsha.mp3'))} volume={0.30} />
      </Sequence>
      {TL.techniques.map((t) => (
        <React.Fragment key={`open-${t.type}`}>
          {/* Whoosh carries the digital wipe; tingsha lands as the new card settles. */}
          <Sequence from={Math.round((t.startSec - TRANSITION_SEC * 0.4) * fps)} durationInFrames={Math.round(3 * fps)}>
            <Audio src={staticFile(audio('whoosh.mp3'))} volume={0.16} />
          </Sequence>
          <Sequence from={Math.round((t.startSec + 0.5) * fps)} durationInFrames={Math.round(8 * fps)}>
            <Audio src={staticFile(audio('tingsha.mp3'))} volume={0.22} />
          </Sequence>
          {/* Digital wipe into the technique. */}
          <TechniqueTransition
            startSec={t.startSec - TRANSITION_SEC * 0.4}
            durationSec={TRANSITION_SEC}
            seed={t.type}
          />
        </React.Fragment>
      ))}

      {/* Periodic Like & Subscribe Overlay */}
      {!isEndPromo && !isIntro && <PeriodicLikeBanner until={T_PROMO} />}
      {/* Soft Background Meditation Music */}
      <Audio src={staticFile('library/music/clips/humming.mp3')} volume={0.30} loop />
      {/* AUDIO POLICY — bare minimum guidance.
          One 15s session intro + one ~18s spoken intro at the head of each technique.
          The repeating inhale/exhale/hold/kumbhaka cue clips were removed: over a 5-minute
          hold they read as chatter rather than guidance. Pacing is carried visually by the
          CircularTimer dot and the BreathingPhasePanel countdown instead.
          Do not re-add per-cycle cue audio. */}
      {/* Each technique opens with its spoken instruction inside the lead-in window
          (PranayamSpec.leadInSec), so breathing never starts while the voice is talking. */}
      {isIntro && (
        <Sequence from={0} durationInFrames={INTRO_SEC * fps}>
          <Audio src={staticFile(audio('intro_voice.mp3'))} volume={0.85} />
        </Sequence>
      )}
      {isBhastrika && (
        <Sequence from={T_BHASTRIKA * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile(audio('bhastrika_voice.mp3'))} volume={0.85} />
        </Sequence>
      )}
      {isKapalbhati && (
        <Sequence from={T_KAPALBHATI * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile(audio('kapalbhati_voice.mp3'))} volume={0.85} />
        </Sequence>
      )}
      {isAnulomVilom && (
        <Sequence from={T_ANULOM * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile(audio('anulom_vilom_voice.mp3'))} volume={0.85} />
        </Sequence>
      )}
      {isBahya && (
        <Sequence from={T_BAHYA * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile(audio('bahya_voice.mp3'))} volume={0.85} />
        </Sequence>
      )}
      {isBhramari && (
        <Sequence from={T_BHRAMARI * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile(audio('bhramari_voice.mp3'))} volume={0.85} />
        </Sequence>
      )}
      {/* "Beautifully done. Relax." over the relaxation between techniques. */}
      {isResting && (() => {
        const at = isRest1 ? T_REST_1 : isRest2 ? T_REST_2 : isRest3 ? T_REST_3 : T_REST_4;
        return (
          <Sequence from={Math.round(at * fps)} durationInFrames={Math.round(REST_SEC * fps)}>
            <Audio src={staticFile(audio('cue_relax.mp3'))} volume={0.85} />
          </Sequence>
        );
      })()}

      {/* --- BREATHING SOUND ---
          Not spoken cues (those were removed as chatter) but the sound of the practice
          itself, so the rhythm is followable with the eyes closed. One pre-rendered track
          per technique covers exactly one round; it is placed once per round at a start
          time derived from the spec, so retiming a technique retimes its audio.
          Each track's length equals roundSeconds() — see gen_pranayam_sfx.py. */}
      {isActiveTechnique && (() => {
        const spec = PRANAYAM_SPECS[currentType];
        const roundLen = roundSeconds(spec);
        const roundSlot = roundLen + spec.restBetweenRoundsSec;
        // Bhastrika breath sounds are louder/more forceful by nature — keep them subtle
        const breathVolume = BREATH_VOLUME[currentType];
        return Array.from({ length: spec.rounds }).map((_, r) => {
          const at = currentStartSec + spec.leadInSec + r * roundSlot;
          return (
            <Sequence
              key={`breath-${currentType}-${r}`}
              from={Math.round(at * fps)}
              durationInFrames={Math.round(roundLen * fps)}
              style={{
                translate: "1081px 664.4px"
              }}>
              <Audio src={staticFile(audio(BREATH_TRACKS[currentType]))} volume={breathVolume} />
            </Sequence>
          );
        });
      })()}
      {/* --- SPOKEN CUES ---
          One soft word at the start of each phase, plus the closing retention sequence
          and the rest call. Built as DATA first and then scheduled, because these come
          from three different rules that used to collide: at every round boundary
          "Exhale", "Rest" and the release line all fired within half a second of each
          other and you heard three voices at once.

          scheduleCues() drops any cue that would start before the previous one has
          finished speaking, so overlap is structurally impossible rather than something
          to notice and patch each time a rule is added. */}
      {isActiveTechnique && currentType !== 'kapalbhati' && (() => {
        const spec = PRANAYAM_SPECS[currentType];
        const cycle = cycleSeconds(spec);
        const roundLen = roundSeconds(spec);
        const roundSlot = roundLen + spec.restBetweenRoundsSec;
        const CUE_VOL = 0.55;

        type Cue = { key: string; at: number; file: string; vol: number; priority: number };
        const planned: Cue[] = [];

        const phaseFile = (phase: 'inhale' | 'hold1' | 'exhale' | 'hold2', side: 'left' | 'right') => {
          if (phase === 'hold1' || phase === 'hold2') return 'cue_hold.mp3';
          if (spec.alternatesSides) {
            if (phase === 'inhale') return side === 'left' ? 'cue_inhale_left.mp3' : 'cue_inhale_right.mp3';
            return side === 'left' ? 'cue_exhale_right.mp3' : 'cue_exhale_left.mp3';
          }
          return phase === 'inhale' ? 'cue_inhale.mp3' : 'cue_exhale.mp3';
        };

        for (let r = 0; r < spec.rounds; r++) {
          const roundStart = currentStartSec + spec.leadInSec + r * roundSlot;

          for (let b = 0; b < spec.breathsPerRound; b++) {
            const breathStart = roundStart + b * cycle;
            const side: 'left' | 'right' = b % 2 === 0 ? 'left' : 'right';
            let offset = 0;

            for (const phase of ['inhale', 'hold1', 'exhale', 'hold2'] as const) {
              const dur = spec.pattern[phase];
              if (dur <= 0) continue;
              const at = breathStart + offset;
              offset += dur;

              // The round opens with the two affirmations instead of bare cues.
              if (b === 0 && (phase === 'inhale' || phase === 'exhale')) {
                planned.push({
                  key: `aff-${currentType}-r${r}-${phase}`,
                  at,
                  file: phase === 'inhale' ? 'affirmation_inhale.mp3' : 'affirmation_exhale.mp3',
                  vol: 0.85,
                  priority: 3,
                });
                continue;
              }

              // A spoken word runs ~2s; firing one into a 1s phase truncates it mid-word.
              if (dur < PHASE_CUE_MIN_SEC) continue;

              planned.push({
                key: `cue-${currentType}-r${r}-b${b}-${phase}`,
                at,
                file: phaseFile(phase, side),
                vol: CUE_VOL,
                priority: 1,
              });
            }
          }

          // Closing retention: inhale, hold, then release the held breath.
          if (spec.endOfRoundInhaleSec > 0) {
            const inhaleStart = roundStart + breathingSeconds(spec);
            planned.push({ key: `close-in-${r}`, at: inhaleStart, file: 'cue_inhale.mp3', vol: CUE_VOL, priority: 4 });

            if (spec.endOfRoundAntarSec > 0) {
              const antarStart = inhaleStart + spec.endOfRoundInhaleSec;
              planned.push({ key: `close-hold-${r}`, at: antarStart, file: 'cue_hold.mp3', vol: CUE_VOL, priority: 4 });
            }
          }

          // The retention ending and the rest beginning are the SAME moment, so where a
          // technique has a closing hold they share one clip ("Exhale, and rest").
          // Two separate cues half a second apart simply talked over each other.
          const isLastRound = r === spec.rounds - 1;
          const hasRest = !isLastRound && spec.restBetweenRoundsSec > 0;
          if (hasRest) {
            const closesWithHold = spec.endOfRoundInhaleSec > 0 && spec.endOfRoundAntarSec > 0;
            planned.push({
              key: `rest-${r}`,
              at: roundStart + roundLen,
              file: closesWithHold ? 'cue_exhale_rest.mp3' : 'cue_rest.mp3',
              vol: CUE_VOL,
              priority: 5,
            });
          }
        }

        return scheduleCues(planned).map((c) => (
          <Sequence
            key={c.key}
            from={Math.round(c.at * fps)}
            durationInFrames={Math.round((VOICE_CLIP_SEC[c.file] ?? 3) * fps)}
          >
            <Audio src={staticFile(audio(c.file))} volume={c.vol} />
          </Sequence>
        ));
      })()}
      {/* Sparkle Particles */}
      <SparkleParticlesOverlay count={30} />
      {/* Botanical Leaf Flourish */}
      <svg width="220" height="140" viewBox="0 0 220 140" fill="none"
        style={{ position: 'absolute', top: 0, right: 0, opacity: 0.35, pointerEvents: 'none' }}>
        <path d="M220 0 Q140 30 100 120 M140 40 Q180 20 220 10 M120 70 Q160 50 200 40 M105 100 Q140 80 180 80" stroke="#cfa864" strokeWidth="1.5" />
        <circle cx="100" cy="120" r="4" fill="#cfa864" />
      </svg>
      {/* Top Header Bar */}
      <div style={{
        position: 'absolute', top: '24px', left: '48px', right: '48px',
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 50
      }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '58px', height: '58px', borderRadius: '14px', flexShrink: 0,
            backgroundColor: 'rgba(255,253,248,0.85)', border: '1.5px solid rgba(207,168,100,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(122,106,88,0.10)', overflow: 'hidden'
          }}>
            {/* A 128px asset, not the 2.1 MB 1254px original — at 42px on screen the
                full-size PNG only bought a decode race that left the badge blank on the
                opening frames. (`from` is a Sequence prop and did nothing here.) */}
            <Img
              src={staticFile('library/logos/si-logo-128.png')}
              style={{ width: '42px', height: '42px', objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: 700, color: '#2b2520', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              SOULFUL INTELLIGENCE STUDIO
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 800, color: '#7a6a58', letterSpacing: '0.18em', marginTop: '3px', textTransform: 'uppercase' }}>
              BREATHE • OBSERVE • TRANSFORM
            </div>
          </div>

          {/* Whole-session countdown, spanning the empty width of the header.
              Fades out under the periodic LIKE banner rather than being covered by it. */}
          {!isEndPromo && (
            <>
              <div style={{ width: '1px', height: '46px', backgroundColor: 'rgba(207,168,100,0.45)', marginLeft: '12px', opacity: 1 - bannerOpacity }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '7px', opacity: 1 - bannerOpacity }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontFamily: FONT_BODY, fontSize: '11px', fontWeight: 800, color: '#7a6a58', letterSpacing: '0.18em' }}>
                    TOTAL PRACTICE LEFT
                  </span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: '26px', fontWeight: 700, color: '#2b2520', lineHeight: 1 }}>
                    {sessionTimeLeft}
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(207,168,100,0.22)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sessionProgress * 100}%`, backgroundColor: '#cfa864', borderRadius: '3px' }} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* The WhatsApp QR lives in the footer banner alongside the other two QR codes —
            up here it collided with the LIKE banner and the practice-left bar. */}
      </div>
      {/* Main Stage
          Vertical budget: header bar ends at y=82, GlobalWrapper's brand banner owns the
          bottom 110px (+6px frame border). Keeping the stage inside 96..126 means nothing
          in here can ever slide under the banner. Usable area: 1832 x 858. */}
      <div style={{
        position: 'absolute', top: '96px', bottom: '126px', left: '44px', right: '44px',
        display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', zIndex: 40,
        overflow: 'hidden'
      }}>
        {/* SESSION OVERVIEW (INTRO) */}
        {isIntro && (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SessionOverviewCard level={level} />
          </div>
        )}

        {/* REST INTERVALS */}
        {isResting && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isRest1 && <RestCard startSec={T_REST_1} durationInSeconds={REST_SEC} nextTechniqueTitle="Skull Shining Breath" />}
            {isRest2 && <RestCard startSec={T_REST_2} durationInSeconds={REST_SEC} nextTechniqueTitle="Alternate Nostril Breathing" />}
            {isRest3 && <RestCard startSec={T_REST_3} durationInSeconds={REST_SEC} nextTechniqueTitle="External Breath Retention" />}
            {isRest4 && <RestCard startSec={T_REST_4} durationInSeconds={REST_SEC} nextTechniqueTitle="Humming Bee Breath" />}
          </div>
        )}

        {/* ACTIVE TECHNIQUE: 3-column layout matching reference design */}
        {isActiveTechnique && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '20px' }}>

            {/* === COLUMN 1: Left Technique Info Card (470 + 20 gap) === */}
            <div style={{ flex: '0 0 470px', minWidth: 0, display: 'flex' }}>
              {isBhastrika && (
                <PranayamCard number={1} title="BHASTRIKA PRANAYAMA" sanskritName="Bellows Breathing" durationMinutes={practiceMinutes}
                  instructions={["Sit comfortably with a straight spine.", "Deep inhale through the nose.", "Forceful exhale through the nose.", "Maintain a steady, rhythmic pace.", "End each round holding the breath in."]} />
              )}
              {isKapalbhati && (
                <PranayamCard number={2} title="KAPALBHATI PRANAYAMA" sanskritName="Skull Shining Breath" durationMinutes={practiceMinutes}
                  instructions={["Sit upright with spine straight and shoulders relaxed.", "Exhale forcefully contracting lower abdominal muscles.", "Allow inhalation to happen naturally and passively.", "Keep rhythm steady and comfortable.", "End each round holding the breath in."]} />
              )}
              {isAnulomVilom && (
                <PranayamCard number={3} title="ANULOM VILOM" sanskritName="Alternate Nostril Breathing" durationMinutes={practiceMinutes}
                  instructions={["Close right nostril, inhale through the left.", "Hold the breath in — antar kumbhaka.", "Close left nostril, exhale through the right.", "Hold the breath out — bahya kumbhaka.", "Repeat, now leading with the right nostril."]} />
              )}
              {isBahya && (
                <PranayamCard
                  number={4} title="BAHYA PRANAYAMA" sanskritName="External Breath Retention" durationMinutes={practiceMinutes}
                  instructions={[
                    "Deep inhale followed by complete exhalation.",
                    "Hold breath out and engage Root Lock (Mula Bandha).",
                    "Pull stomach in for Abdominal Lock (Uddiyana).",
                    "Touch chin to chest for Throat Lock (Jalandhara).",
                    "Release locks smoothly before inhaling."
                  ]}
                />
              )}
              {isBhramari && (
                <PranayamCard
                  number={5} title="BHRAMARI PRANAYAMA" sanskritName="Humming Bee Breath" durationMinutes={practiceMinutes}
                  instructions={[
                    "Thumbs close the ears; index fingers on closed eyelids.",
                    "Middle fingers rest lightly beside the nostrils.",
                    "Ring fingers above the lips, little fingers below.",
                    "That is Shanmukhi Mudra — the six gates sealed.",
                    "Inhale deeply, then pause briefly at the top.",
                    "Exhale with a steady humming sound like a bee.",
                  ]}
                />
              )}
            </div>

            {/* === COLUMN 2: Center — Unified Card (Badges + Circular Timer) + Next Card === */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>

              {/* Single Unified Card containing STROKE, ROUND, and CIRCULAR TIMER */}
              <div style={{
                flex: 1, width: '100%', minHeight: 0,
                backgroundColor: 'rgba(255,253,248,0.85)',
                border: '1.5px solid rgba(207,168,100,0.40)',
                borderRadius: '28px',
                display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                boxShadow: '0 16px 40px rgba(122,106,88,0.10)',
                backdropFilter: 'blur(24px)',
                overflow: 'hidden'
              }}>
                {/* Integrated Top Bar inside Card */}
                {breathState && (
                  <div style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                    borderBottom: '1px solid rgba(207,168,100,0.25)',
                    backgroundColor: 'rgba(255,253,248,0.60)',
                    flexShrink: 0
                  }}>
                    {/* BREATH / STROKE / CYCLE */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '14px 24px' }}>
                      <div style={{ fontSize: '20px' }}>🔄</div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontFamily: FONT_BODY, fontSize: '10px', fontWeight: 800, color: COLORS.accent, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                          {PRANAYAM_SPECS[currentType].repUnit}
                        </div>
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize: '26px', fontWeight: 700, color: '#2b2520', lineHeight: 1 }}>
                          {String(breathState.started && !breathState.resting ? breathState.repIndex : 0).padStart(2, '0')}
                          <span style={{ fontSize: '16px', fontWeight: 500, color: '#7a6a58', marginLeft: '5px' }}>
                            / {String(breathState.repsPerRound).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vertical divider */}
                    <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(207,168,100,0.30)' }} />

                    {/* ROUND */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 24px', backgroundColor: `${COLORS.accent}12` }}>
                      <div style={{ fontFamily: FONT_BODY, fontSize: '10px', fontWeight: 800, color: COLORS.accent, letterSpacing: '0.20em', textTransform: 'uppercase' }}>ROUND</div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: '30px', fontWeight: 700, color: COLORS.accent, lineHeight: 1, marginTop: '2px' }}>
                        {breathState.round}
                        <span style={{ fontSize: '17px', fontWeight: 600, opacity: 0.75, marginLeft: '6px' }}>OF {breathState.rounds}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Circular Timer filling remaining card space */}
                <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularTimer startSec={currentStartSec} type={currentType} level={level} />
                </div>
              </div>

              {/* Dynamic Healing Breath Affirmations Card */}
              <div style={{ width: '100%', flexShrink: 0 }}>
                <BreathAffirmationCard startSec={currentStartSec} type={currentType} level={level} />
              </div>
            </div>

            {/* === COLUMN 3: Right — posture reference during the spoken instruction,
                 then the breathing pattern once practice starts. Bahya and Bhramari both
                 need a body position that words alone do not convey, so each gets an
                 animated diagram for exactly as long as its instructions are playing. === */}
            <div style={{ flex: '0 0 400px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {isBahya && inLeadIn ? (
                <BandhaDiagram startSec={T_BAHYA} />
              ) : isBhramari && inLeadIn ? (
                <ShanmukhiMudraDiagram startSec={T_BHRAMARI} />
              ) : (
                <BreathingPhasePanel startSec={currentStartSec} type={currentType} level={level} />
              )}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default PranayamSession;
