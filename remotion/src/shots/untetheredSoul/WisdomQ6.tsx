import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random,
  staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

const SRC = 'projects/untetheredSoul/Q6/';

export const compositionConfig = {
  id: 'WisdomQ6',
  width: 1920,
  height: 1080,
  fps: 30,
  // Literal, not a const: gen-registry.mjs reads this file statically and cannot
  // resolve a variable — it silently fell back to 5s. Clip runs 9:53.
  durationInSeconds: 594,
};

/**
 * Text treatments, taken from the reference sheet. Each segment picks the one that
 * suits what is being said rather than cycling for variety's sake — the numbered
 * steps all share `chapter` so the spine of the talk reads as a sequence.
 */
type Style = 'title' | 'card' | 'timeline' | 'keywords' | 'chapter' | 'bubble' | 'quote';

interface Segment {
  at: number;            // start second
  style: Style;
  eyebrow?: string;
  title: string;
  lines?: string[];      // body copy / keyword list / timeline items
  /** Concept art key — swapped for a generated image by dropping a file in img/. */
  art: ArtKey;
  /** Optional generated still, e.g. 'img/03-body.jpg'. Falls back to drawn art. */
  image?: string;
  num?: string;
}

type ArtKey =
  | 'rising' | 'sharp' | 'body' | 'buried' | 'night' | 'doubleHand'
  | 'welcome' | 'soften' | 'lift' | 'rejoice' | 'hands' | 'clouds' | 'sky';

/**
 * Every concept gets a visual behind the speaker. Timings follow the transcript's own
 * speaker markers (0:00, 1:29, 3:31, 5:12, 7:05, 9:20) with the beats between them
 * placed on the sentence that introduces each idea.
 */
const SEGMENTS: Segment[] = [
  { at: 0,   style: 'title',    eyebrow: 'THE UNTETHERED SOUL · Q6',
    title: 'Shame Is Trying To Leave',
    lines: ['You do not get free by pushing it away.'], art: 'rising' },

  { at: 22,  style: 'quote',
    title: 'The shame you feel is an old energy from your past.',
    lines: ['It is not here to hurt you. It is trying to leave.'], art: 'rising' },

  { at: 48,  style: 'card',     eyebrow: 'WHAT HAPPENS',
    title: 'A Friend Says Something Sharp',
    lines: ['Your chest tightens.', 'Your face gets hot.', 'An old feeling opens up.'], art: 'sharp' },

  { at: 82,  style: 'keywords', eyebrow: 'WHAT WE DO INSTEAD',
    title: 'We Find A Distraction',
    lines: ['Go quiet', 'End the conversation', 'Turn the music up'], art: 'buried' },

  { at: 110, style: 'quote',
    title: 'A deep feeling came up — and you pushed it back down.',
    lines: ['You have been doing this for years. That is why it is still inside you.'], art: 'buried' },

  { at: 150, style: 'timeline', eyebrow: 'MICHAEL SINGER TEACHES',
    title: 'Old, Unfinished Energy',
    lines: ['It is not a new problem', 'It is an old energy releasing', 'Their words only made a crack'], art: 'rising' },

  { at: 195, style: 'card',     eyebrow: 'NOTICE WHERE YOU PUSH',
    title: 'The Body Does The Holding',
    lines: ['A tight jaw', 'Clenched hands', 'A closed throat', 'A heavy stomach'], art: 'body' },

  { at: 240, style: 'quote',
    title: 'When shame comes up, we feel ashamed that it came up.',
    lines: ['That thought is a hand pushing the old pain back down.'], art: 'doubleHand' },

  { at: 285, style: 'chapter',  num: '01', eyebrow: 'STEP ONE',
    title: 'It Is Coming To Leave',
    lines: ['Awake at 2am, chest hot, an old memory playing.',
            'Nothing is wrong. The mind is quiet, so it finally rises.'], art: 'night' },

  { at: 340, style: 'chapter',  num: '02', eyebrow: 'STEP TWO',
    title: 'Don’t Be Ashamed Of The Shame',
    lines: ['The first shame is old and left over.',
            'The second is happening now — and keeps the first trapped.'], art: 'doubleHand' },

  { at: 385, style: 'chapter',  num: '03', eyebrow: 'STEP THREE',
    title: 'Welcome It',
    lines: ['“I see you. You are welcome to come up.”',
            'Not liking the past — welcoming the energy that is leaving.'], art: 'welcome' },

  { at: 425, style: 'chapter',  num: '04', eyebrow: 'STEP FOUR',
    title: 'Relax Through The Pain',
    lines: ['You do not have to enjoy it. Just stop squeezing.',
            'Whatever you hold tightly stays trapped inside you.'], art: 'soften' },

  { at: 460, style: 'chapter',  num: '05', eyebrow: 'STEP FIVE',
    title: 'Lift It Up',
    lines: ['We try to fix ourselves by hiding the broken parts.',
            'You do not heal by leaving pain behind. You heal by lifting it up.'], art: 'lift' },

  { at: 495, style: 'chapter',  num: '06', eyebrow: 'STEP SIX',
    title: 'Be Glad It Is Leaving',
    lines: ['It is not a bad day. It is a cleaning day.'], art: 'rejoice' },

  { at: 520, style: 'bubble',   eyebrow: 'THE PRACTICE',
    title: 'Open Your Hands. Lift Them Up.',
    lines: ['“I am not taking anything personally anymore. I am letting you go.”'], art: 'hands' },

  { at: 545, style: 'keywords', eyebrow: 'A WEEK LATER',
    title: 'You Just Drive',
    lines: ['No music', 'Chest tight', 'Bring it on'], art: 'clouds' },

  { at: 570, style: 'title',    eyebrow: 'REST HERE',
    title: 'You Are The One Who Noticed',
    lines: ['You are not the shame. You are the one watching it leave.'], art: 'sky' },
];

// ---------------------------------------------------------------- concept art

/**
 * Drawn concept art in the brand palette, sitting behind the speaker.
 *
 * Each is a slow, near-still composition — this is a talk about settling, so anything
 * that moves quickly would fight the speaker. Swapped automatically for a generated
 * still when `image` is set on the segment.
 */
const ConceptArt: React.FC<{ art: ArtKey; t: number }> = ({ art, t }) => {
  const drift = Math.sin(t * 0.22) * 10;
  const breathe = 0.5 + 0.5 * Math.sin(t * 0.5);
  const gold = COLORS.accent2;

  const Rings = ({ n, cx, cy, base }: { n: number; cx: number; cy: number; base: number }) => (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const p = ((t * 0.12) + i / n) % 1;
        return (
          <circle key={i} cx={cx} cy={cy} r={base + p * 320}
            fill="none" stroke={gold} strokeWidth={2} opacity={0.30 * (1 - p)} />
        );
      })}
    </>
  );

  return (
    <svg viewBox="0 0 1100 1080" style={{ width: '100%', height: '100%' }}>
      {art === 'rising' && (
        <>
          <Rings n={5} cx={520} cy={640} base={90} />
          {Array.from({ length: 26 }).map((_, i) => {
            const seed = random(`rise-${i}`);
            const y = 1000 - ((t * 26 + seed * 1000) % 1000);
            return <circle key={i} cx={220 + seed * 620} cy={y} r={3 + seed * 5}
              fill={gold} opacity={0.5 * (y / 1000)} />;
          })}
        </>
      )}

      {art === 'sharp' && (
        <>
          <circle cx={520} cy={560} r={220} fill="none" stroke={gold} strokeWidth={2} opacity={0.35} />
          {Array.from({ length: 9 }).map((_, i) => {
            const a = (i / 9) * Math.PI * 2;
            return <line key={i} x1={520 + Math.cos(a) * 230} y1={560 + Math.sin(a) * 230}
              x2={520 + Math.cos(a) * (330 + breathe * 40)} y2={560 + Math.sin(a) * (330 + breathe * 40)}
              stroke={gold} strokeWidth={3} opacity={0.5} strokeLinecap="round" />;
          })}
        </>
      )}

      {art === 'body' && (
        <g fill="none" stroke="#c4b3a0" strokeWidth={3} strokeLinecap="round">
          <circle cx={520} cy={300} r={64} />
          <path d="M430 420 q90 -40 180 0 l34 250 q-104 44 -248 0 Z" />
          <path d="M430 430 q-70 110 -50 220" />
          <path d="M610 430 q70 110 50 220" />
          {[
            { y: 392, l: 'JAW' }, { y: 660, l: 'HANDS' },
            { y: 420, l: 'THROAT' }, { y: 600, l: 'STOMACH' },
          ].map((p, i) => (
            <g key={p.l} opacity={0.35 + 0.65 * (Math.sin(t * 0.8 - i) > 0.4 ? 1 : 0.25)}>
              <circle cx={520} cy={p.y} r={26} stroke={gold} strokeWidth={3} />
            </g>
          ))}
        </g>
      )}

      {art === 'buried' && (
        <>
          <rect x={140} y={700} width={760} height={4} fill={gold} opacity={0.5} />
          {Array.from({ length: 5 }).map((_, i) => (
            <circle key={i} cx={300 + i * 130} cy={790 + Math.sin(t * 0.4 + i) * 8}
              r={26 - i * 2} fill={gold} opacity={0.3} />
          ))}
          <path d={`M520 ${640 + drift} l-42 70 h84 Z`} fill={gold} opacity={0.7} />
        </>
      )}

      {art === 'night' && (
        <>
          {Array.from({ length: 60 }).map((_, i) => {
            const s = random(`n-${i}`);
            return <circle key={i} cx={120 + s * 860} cy={80 + random(`ny-${i}`) * 900}
              r={1.5 + s * 2} fill={gold}
              opacity={0.25 + 0.55 * Math.abs(Math.sin(t * 0.6 + i))} />;
          })}
          <circle cx={520} cy={520} r={150 + breathe * 14} fill="none" stroke={gold} strokeWidth={2} opacity={0.4} />
        </>
      )}

      {art === 'doubleHand' && (
        <g fill="none" stroke={gold} strokeWidth={3} strokeLinecap="round">
          <path d={`M330 ${430 + drift * 0.4} q190 -120 380 0`} opacity={0.75} />
          <path d={`M330 ${640 - drift * 0.4} q190 120 380 0`} opacity={0.45} />
          <circle cx={520} cy={535} r={54 + breathe * 8} stroke={gold} strokeWidth={2} opacity={0.5} />
        </g>
      )}

      {art === 'welcome' && (
        <>
          <Rings n={4} cx={520} cy={560} base={110} />
          <path d="M360 620 q160 -150 320 0" fill="none" stroke={gold} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
        </>
      )}

      {art === 'soften' && (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i}
              d={`M180 ${360 + i * 62} q170 ${-30 - breathe * 26} 340 0 q170 ${30 + breathe * 26} 340 0`}
              fill="none" stroke={gold} strokeWidth={2.5} opacity={0.18 + i * 0.07} />
          ))}
        </>
      )}

      {art === 'lift' && (
        <>
          <path d="M400 720 q120 -70 240 0" fill="none" stroke={gold} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
          {Array.from({ length: 14 }).map((_, i) => {
            const p = ((t * 0.20) + i / 14) % 1;
            return <circle key={i} cx={520 + Math.sin(i * 2.1) * 60 * p} cy={700 - p * 560}
              r={4 + (1 - p) * 6} fill={gold} opacity={0.65 * (1 - p)} />;
          })}
        </>
      )}

      {art === 'rejoice' && (
        <>
          <Rings n={6} cx={520} cy={540} base={70} />
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2 + t * 0.1;
            const r = 280 + breathe * 30;
            return <circle key={i} cx={520 + Math.cos(a) * r} cy={540 + Math.sin(a) * r}
              r={5} fill={gold} opacity={0.6} />;
          })}
        </>
      )}

      {art === 'hands' && (
        <g fill="none" stroke={gold} strokeWidth={4} strokeLinecap="round">
          <path d="M330 660 q90 -120 180 -40" opacity={0.8} />
          <path d="M710 660 q-90 -120 -180 -40" opacity={0.8} />
          <circle cx={520} cy={520 - breathe * 26} r={40 + breathe * 12} stroke={gold} strokeWidth={3} opacity={0.7} />
        </g>
      )}

      {art === 'clouds' && (
        <>
          {Array.from({ length: 5 }).map((_, i) => {
            const x = ((t * 14 + i * 260) % 1400) - 200;
            return <ellipse key={i} cx={x} cy={280 + i * 120} rx={150} ry={38}
              fill={gold} opacity={0.12 + i * 0.03} />;
          })}
        </>
      )}

      {art === 'sky' && (
        <>
          <Rings n={3} cx={520} cy={560} base={140} />
          {Array.from({ length: 40 }).map((_, i) => {
            const s = random(`s-${i}`);
            return <circle key={i} cx={100 + s * 900} cy={100 + random(`sy-${i}`) * 880}
              r={1 + s * 2.5} fill={gold} opacity={0.2 + 0.5 * Math.abs(Math.sin(t * 0.4 + i))} />;
          })}
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- text styles

const TextBlock: React.FC<{ seg: Segment; rel: number }> = ({ seg, rel }) => {
  const inn = interpolate(rel, [0, 0.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rise = (1 - inn) * 26;
  const line = (i: number) =>
    interpolate(rel, [0.5 + i * 0.22, 1.2 + i * 0.22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const eyebrow = seg.eyebrow && (
    <div style={{
      fontFamily: FONT_BODY, fontSize: 15, fontWeight: 800, color: COLORS.accent2,
      letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 14,
    }}>
      {seg.eyebrow}
    </div>
  );

  const base: React.CSSProperties = {
    position: 'absolute', left: 96, top: 0, bottom: 0, width: 780,
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    opacity: inn, transform: `translateY(${rise}px)`,
  };

  if (seg.style === 'chapter') {
    return (
      <div style={base}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginBottom: 10 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 96, fontWeight: 700, color: COLORS.accent2, lineHeight: 1 }}>
            {seg.num}
          </span>
          <div>
            {eyebrow}
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 58, fontWeight: 700, color: '#2b2520', lineHeight: 1.06 }}>
              {seg.title}
            </div>
          </div>
        </div>
        <div style={{ width: 300, height: 2, background: COLORS.accent2, opacity: 0.6, margin: '10px 0 20px' }} />
        {seg.lines?.map((l, i) => (
          <div key={l} style={{
            fontFamily: FONT_BODY, fontSize: 24, color: '#4b4038', lineHeight: 1.5,
            marginBottom: 10, opacity: line(i),
          }}>{l}</div>
        ))}
      </div>
    );
  }

  if (seg.style === 'card') {
    return (
      <div style={base}>
        <div style={{
          background: 'rgba(255,253,248,0.62)', border: '1.5px solid rgba(207,168,100,0.55)',
          borderRadius: 28, padding: '30px 34px', backdropFilter: 'blur(22px)',
          boxShadow: '0 20px 50px rgba(122,106,88,0.14)',
        }}>
          {eyebrow}
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 46, fontWeight: 700, color: '#2b2520', lineHeight: 1.1, marginBottom: 16 }}>
            {seg.title}
          </div>
          {seg.lines?.map((l, i) => (
            <div key={l} style={{
              display: 'flex', gap: 12, alignItems: 'center', marginBottom: 9, opacity: line(i),
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: COLORS.accent2, flexShrink: 0 }} />
              <span style={{ fontFamily: FONT_BODY, fontSize: 23, color: '#4b4038' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (seg.style === 'timeline') {
    return (
      <div style={base}>
        {eyebrow}
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 54, fontWeight: 700, color: '#2b2520', lineHeight: 1.08, marginBottom: 26 }}>
          {seg.title}
        </div>
        {seg.lines?.map((l, i) => (
          <div key={l} style={{ display: 'flex', gap: 18, opacity: line(i), marginBottom: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 13, height: 13, borderRadius: 7, background: COLORS.accent2 }} />
              {i < (seg.lines!.length - 1) && (
                <div style={{ width: 2, flex: 1, minHeight: 40, background: 'rgba(207,168,100,0.4)' }} />
              )}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 24, color: '#4b4038', paddingBottom: 26 }}>{l}</div>
          </div>
        ))}
      </div>
    );
  }

  if (seg.style === 'keywords') {
    return (
      <div style={base}>
        {eyebrow}
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 54, fontWeight: 700, color: '#2b2520', lineHeight: 1.08, marginBottom: 24 }}>
          {seg.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {seg.lines?.map((l, i) => (
            <div key={l} style={{
              alignSelf: 'flex-start',
              background: 'rgba(207,168,100,0.16)', border: '1.5px solid rgba(207,168,100,0.55)',
              borderRadius: 16, padding: '10px 22px',
              fontFamily: FONT_BODY, fontSize: 25, fontWeight: 700, color: '#4b4038',
              opacity: line(i), transform: `translateX(${(1 - line(i)) * -18}px)`,
            }}>{l}</div>
          ))}
        </div>
      </div>
    );
  }

  if (seg.style === 'bubble') {
    return (
      <div style={base}>
        <div style={{
          alignSelf: 'flex-start', borderRadius: '50%',
          width: 520, height: 520, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 60,
          background: 'rgba(255,253,248,0.55)', border: `2px solid ${COLORS.accent2}`,
          backdropFilter: 'blur(20px)', boxSizing: 'border-box',
        }}>
          {eyebrow}
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700, color: '#2b2520', lineHeight: 1.15 }}>
            {seg.title}
          </div>
          {seg.lines?.map((l) => (
            <div key={l} style={{ fontFamily: FONT_BODY, fontSize: 20, color: '#4b4038', marginTop: 16, lineHeight: 1.5 }}>{l}</div>
          ))}
        </div>
      </div>
    );
  }

  if (seg.style === 'quote') {
    return (
      <div style={base}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: COLORS.accent2, marginBottom: 6 }}>“</div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 46, fontStyle: 'italic', fontWeight: 500,
          color: '#2b2520', lineHeight: 1.28,
        }}>
          {seg.title}
        </div>
        {seg.lines?.map((l, i) => (
          <div key={l} style={{
            fontFamily: FONT_BODY, fontSize: 22, color: '#6b5c4d', marginTop: 18,
            lineHeight: 1.5, opacity: line(i),
          }}>{l}</div>
        ))}
      </div>
    );
  }

  // 'title' — no box, sits straight on the art
  return (
    <div style={base}>
      {eyebrow}
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 76, fontWeight: 700, color: '#2b2520',
        lineHeight: 1.02, letterSpacing: '0.01em',
      }}>
        {seg.title}
      </div>
      <div style={{ width: 220, height: 2, background: COLORS.accent2, opacity: 0.7, margin: '22px 0' }} />
      {seg.lines?.map((l, i) => (
        <div key={l} style={{ fontFamily: FONT_BODY, fontSize: 24, color: '#4b4038', lineHeight: 1.5, opacity: line(i) }}>{l}</div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- composition

export const WisdomQ6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const idx = Math.max(0, SEGMENTS.findIndex((s, i) =>
    t >= s.at && (i === SEGMENTS.length - 1 || t < SEGMENTS[i + 1].at)));
  const seg = SEGMENTS[idx];
  const rel = t - seg.at;

  // Concept art cross-fades; the wipe is short so it never interrupts the speaker.
  const WIPE = 0.7;
  const wipe = interpolate(rel, [0, WIPE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#f5ebe0' }}>
      {/* Concept visual, behind everything */}
      <AbsoluteFill style={{ opacity: 0.9 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1150 }}>
          {seg.image
            ? <Img src={staticFile(SRC + seg.image)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
            : <ConceptArt art={seg.art} t={t} />}
        </div>
      </AbsoluteFill>

      {/*
        Speaker, keyed onto the art.

        The export is h264, which cannot carry an alpha channel — "background removed"
        means the transparency was flattened to white. `multiply` drops that white to
        nothing while keeping her, so the concept art shows through behind her without
        needing a re-export. If you can supply a WebM/ProRes with real alpha, remove the
        blend mode and it will key properly at the edges too.

        She is centred in the source frame, so the clip is over-scaled inside a
        right-hand column and pushed across to sit beside the copy.
      */}
      <div style={{
        position: 'absolute', right: 0, bottom: 0, top: 0, width: 1080,
        overflow: 'hidden', mixBlendMode: 'multiply',
      }}>
        <OffthreadVideo
          src={staticFile(SRC + 'wisdom-2.6-backRemoved.mp4')}
          style={{
            position: 'absolute', bottom: 0, left: '50%',
            height: '112%', width: 'auto',
            transform: 'translateX(-42%)',
          }}
        />
      </div>

      {/* Soft scrim under the copy so text never fights the art */}
      <AbsoluteFill style={{
        background: 'linear-gradient(90deg, rgba(245,235,224,0.92) 0%, rgba(245,235,224,0.72) 46%, rgba(245,235,224,0) 68%)',
      }} />

      <TextBlock seg={seg} rel={rel} />

      {/* Digital wipe between concepts, seeded per segment so it re-renders identically */}
      {rel < WIPE && (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {Array.from({ length: 14 }).map((_, r) =>
            Array.from({ length: 24 }).map((_, c) => {
              const leave = (c / 24) * 0.55 + random(`${seg.at}-${r}-${c}`) * 0.45;
              if (wipe >= leave) return null;
              return <div key={`${r}-${c}`} style={{
                position: 'absolute', left: `${(c / 24) * 100}%`, top: `${(r / 14) * 100}%`,
                width: `${100 / 24 + 0.05}%`, height: `${100 / 14 + 0.05}%`, background: '#f3e7d6',
              }} />;
            }))}
        </AbsoluteFill>
      )}

      {/* Sound: a whoosh carries each wipe, tingsha marks the six numbered steps. */}
      {SEGMENTS.map((s) => (
        <React.Fragment key={s.at}>
          <Sequence from={Math.round(s.at * fps)} durationInFrames={Math.round(3 * fps)}>
            <Audio src={staticFile('library/audio/pranayam/whoosh.mp3')} volume={0.13} />
          </Sequence>
          {s.style === 'chapter' && (
            <Sequence from={Math.round((s.at + 0.35) * fps)} durationInFrames={Math.round(7 * fps)}>
              <Audio src={staticFile('library/audio/pranayam/tingsha.mp3')} volume={0.16} />
            </Sequence>
          )}
        </React.Fragment>
      ))}

      {/* Bed, well under the voice. */}
      <Audio src={staticFile('library/music/clips/humming.mp3')} volume={0.10} loop />
    </AbsoluteFill>
  );
};

export default WisdomQ6;
