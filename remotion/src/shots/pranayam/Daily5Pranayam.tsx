import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, Audio, Sequence, staticFile } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import CircularTimer from './CircularTimer';
import BreathingPhasePanel from './BreathingPhasePanel';
import PranayamCard from './PranayamCard';
import RestCard from './RestCard';
import NextRestPreview from './NextRestPreview';
import SessionOverviewCard from './SessionOverviewCard';
import SparkleParticlesOverlay from '../brand/SparkleParticlesOverlay';
import PromoEndCard from '../brand/PromoEndCard';
import PeriodicLikeBanner, { likeBannerOpacity } from '../brand/PeriodicLikeBanner';
import TechniqueCompleteCard from './TechniqueCompleteCard';
import {
  PranayamType, PRANAYAM_SPECS, totalSeconds, cycleSeconds, roundSeconds, breathingSeconds, totalReps,
} from './breathPattern';

// --- MASTER TIMELINE ---
// Every technique slot is derived from its spec (spoken lead-in + exactly 300s of
// practice), so changing a protocol in breathPattern.ts reflows the whole video
// without any number here needing to be touched.
const INTRO_SEC = 36;        // session intro voice runs 31.8s at the slowed pace
const REST_SEC = 10;         // relaxation between techniques
const VOICE_WINDOW_SEC = 28; // longest technique intro clip is 23.2s
const PROMO_SEC = 18;
const CELEBRATE_SEC = 8;     // congratulation flash after each technique

const slot = (t: PranayamType) => totalSeconds(PRANAYAM_SPECS[t]);

// Each technique is followed by its own celebration window and then the relaxation, so
// the flash never eats into the rest.
const T_BHASTRIKA = INTRO_SEC;
const T_CELEB_1 = T_BHASTRIKA + slot('bhastrika');
const T_REST_1 = T_CELEB_1 + CELEBRATE_SEC;
const T_KAPALBHATI = T_REST_1 + REST_SEC;
const T_CELEB_2 = T_KAPALBHATI + slot('kapalbhati');
const T_REST_2 = T_CELEB_2 + CELEBRATE_SEC;
const T_ANULOM = T_REST_2 + REST_SEC;
const T_CELEB_3 = T_ANULOM + slot('anulom_vilom');
const T_REST_3 = T_CELEB_3 + CELEBRATE_SEC;
const T_BAHYA = T_REST_3 + REST_SEC;
const T_CELEB_4 = T_BAHYA + slot('bahya');
const T_REST_4 = T_CELEB_4 + CELEBRATE_SEC;
const T_BHRAMARI = T_REST_4 + REST_SEC;
const T_FINALE = T_BHRAMARI + slot('bhramari');
const T_PROMO = T_FINALE + CELEBRATE_SEC;

/**
 * Congratulation flash after each technique. Counts and units come straight from the
 * specs, so they can never drift from what the viewer actually just did.
 */
const CELEBRATIONS: Array<{ at: number; type: PranayamType; index: number; title: string; isFinal?: boolean }> = [
  { at: T_CELEB_1, type: 'bhastrika', index: 1, title: 'Bellows Breathing' },
  { at: T_CELEB_2, type: 'kapalbhati', index: 2, title: 'Skull Shining Breath' },
  { at: T_CELEB_3, type: 'anulom_vilom', index: 3, title: 'Alternate Nostril Breathing' },
  { at: T_CELEB_4, type: 'bahya', index: 4, title: 'External Breath Retention' },
  { at: T_FINALE, type: 'bhramari', index: 5, title: 'Humming Bee Breath', isFinal: true },
];

export const compositionConfig = {
  id: 'Daily5Pranayam',
  width: 1920,
  height: 1080,
  fps: 30,
  durationInSeconds: T_PROMO + PROMO_SEC,
};

export const Daily5Pranayam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

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
              <Audio src={staticFile('library/audio/pranayam/completion_chime.mp3')} volume={0.65} />
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
          <Audio src={staticFile('library/audio/pranayam/intro_voice.mp3')} volume={0.85} />
        </Sequence>
      )}
      {isBhastrika && (
        <Sequence from={T_BHASTRIKA * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile('library/audio/pranayam/bhastrika_voice.mp3')} volume={0.85} />
        </Sequence>
      )}
      {isKapalbhati && (
        <Sequence from={T_KAPALBHATI * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile('library/audio/pranayam/kapalbhati_voice.mp3')} volume={0.85} />
        </Sequence>
      )}
      {isAnulomVilom && (
        <Sequence from={T_ANULOM * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile('library/audio/pranayam/anulom_vilom_voice.mp3')} volume={0.85} />
        </Sequence>
      )}
      {isBahya && (
        <Sequence from={T_BAHYA * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile('library/audio/pranayam/bahya_voice.mp3')} volume={0.85} />
        </Sequence>
      )}
      {isBhramari && (
        <Sequence from={T_BHRAMARI * fps} durationInFrames={VOICE_WINDOW_SEC * fps}>
          <Audio src={staticFile('library/audio/pranayam/bhramari_voice.mp3')} volume={0.85} />
        </Sequence>
      )}
      {/* --- GUIDANCE SOUNDS ---
          Not spoken cues (those were removed as chatter) but the sound of the practice
          itself, so the viewer can hear the rhythm with their eyes closed. Start times
          are derived from the specs, so retiming a technique retimes the audio. */}
      {/* Bhramari: one synthesised hum over every exhale. */}
      {isBhramari && Array.from({ length: PRANAYAM_SPECS.bhramari.breathsPerRound }).map((_, i) => {
        const spec = PRANAYAM_SPECS.bhramari;
        const exhaleOffset = spec.pattern.inhale + spec.pattern.hold1;
        const at = T_BHRAMARI + spec.leadInSec + i * cycleSeconds(spec) + exhaleOffset;
        return (
          <Sequence
            key={`hum-${i}`}
            from={Math.round(at * fps)}
            durationInFrames={Math.round(spec.pattern.exhale * fps)}
            style={{
              translate: "-160.8px 160.8px"
            }}>
            <Audio src={staticFile('library/audio/pranayam/bhramari_hum.mp3')} volume={0.5} />
          </Sequence>
        );
      })}
      {/* Kapalbhati: one pre-rendered round of stroke sounds per round of breathing. */}
      {isKapalbhati && Array.from({ length: PRANAYAM_SPECS.kapalbhati.rounds }).map((_, r) => {
        const spec = PRANAYAM_SPECS.kapalbhati;
        const roundSlot = roundSeconds(spec) + spec.restBetweenRoundsSec;
        const at = T_KAPALBHATI + spec.leadInSec + r * roundSlot;
        return (
          <Sequence key={`strokes-${r}`} from={Math.round(at * fps)} durationInFrames={Math.round(breathingSeconds(spec) * fps)}>
            <Audio src={staticFile('library/audio/pranayam/kapalbhati_strokes.mp3')} volume={0.4} />
          </Sequence>
        );
      })}
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
            <Img
              src={staticFile('library/logos/si-logo.png')}
              style={{ width: '42px', height: '42px', objectFit: 'contain' }}
              from={736} />
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
            <SessionOverviewCard />
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
                <PranayamCard number={1} title="BHASTRIKA PRANAYAMA" sanskritName="Bellows Breathing" durationMinutes={5}
                  instructions={["Sit comfortably with a straight spine.", "Deep inhale through the nose.", "Forceful exhale through the nose.", "Maintain a steady, rhythmic pace.", "End each round holding the breath in."]} />
              )}
              {isKapalbhati && (
                <PranayamCard number={2} title="KAPALBHATI PRANAYAMA" sanskritName="Skull Shining Breath" durationMinutes={5}
                  instructions={["Sit upright with spine straight and shoulders relaxed.", "Exhale forcefully contracting lower abdominal muscles.", "Allow inhalation to happen naturally and passively.", "Keep rhythm steady and comfortable.", "End each round holding the breath in."]} />
              )}
              {isAnulomVilom && (
                <PranayamCard number={3} title="ANULOM VILOM" sanskritName="Alternate Nostril Breathing" durationMinutes={5}
                  instructions={["Close right nostril, inhale through the left.", "Hold the breath in — antar kumbhaka.", "Close left nostril, exhale through the right.", "Hold the breath out — bahya kumbhaka.", "Repeat, now leading with the right nostril."]} />
              )}
              {isBahya && (
                <PranayamCard number={4} title="BAHYA PRANAYAMA" sanskritName="External Breath Retention" durationMinutes={5}
                  instructions={["Deep inhale followed by complete exhalation.", "Hold breath out and engage Root Lock (Mula Bandha).", "Pull stomach in for Abdominal Lock (Uddiyana).", "Touch chin to chest for Throat Lock (Jalandhara).", "Release locks smoothly before inhaling."]} />
              )}
              {isBhramari && (
                <PranayamCard number={5} title="BHRAMARI PRANAYAMA" sanskritName="Humming Bee Breath" durationMinutes={5}
                  instructions={["Close ears with thumbs, fingers gently over eyes.", "Inhale deeply through your nose.", "Pause briefly at the top of the inhale.", "Exhale slowly creating a smooth humming sound.", "Feel the vibration resonate through your head."]} />
              )}
            </div>

            {/* === COLUMN 2: Center — Circular Timer + Big Clock + Next Card (fills the remaining ~922) === */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
              {/* Circular Timer Card */}
              <div style={{
                flex: 1, width: '100%', minHeight: 0,
                backgroundColor: 'rgba(255,253,248,0.78)',
                border: '1.5px solid rgba(207,168,100,0.35)',
                borderRadius: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 16px 40px rgba(122,106,88,0.10)',
                backdropFilter: 'blur(24px)',
                overflow: 'hidden'
              }}>
                <CircularTimer startSec={currentStartSec} type={currentType} />
              </div>

              {/* Next Rest Preview */}
              <div style={{ width: '100%', flexShrink: 0 }}>
                <NextRestPreview
                  title={isBhramari ? "GREAT WORK! SESSION COMPLETE" : `${REST_SEC} SEC RELAXATION`}
                  durationSec={isBhramari ? 0 : REST_SEC}
                />
              </div>
            </div>

            {/* === COLUMN 3: Right — Breathing Phase Panel === */}
            <div style={{ flex: '0 0 400px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <BreathingPhasePanel startSec={currentStartSec} type={currentType} />
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default Daily5Pranayam;
