import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import {
  SPECS_BY_LEVEL,
  PranayamLevel,
  PHASE_COLORS,
  PHASE_SANSKRIT,
  PranayamType,
  activePhases,
  cycleSeconds,
  resolveBreath,
  phaseLabel,
} from './breathPattern';

interface CircularTimerProps {
  startSec?: number;
  type?: PranayamType;
  /** Which protocol set to read. Defaults to the beginner session. */
  level?: PranayamLevel;
}

// Convert angle + radius to SVG circle point (0deg = 12 o'clock, clockwise).
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Create SVG arc path for a segment of the circle.
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  startSec = 0,
  type = 'bhastrika',
  level = 'beginner',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const relTime = Math.max(0, currentTime - startSec);

  const spec = SPECS_BY_LEVEL[level][type];
  const state = resolveBreath(spec, relTime);

  // Countdown of PRACTICE time. Stays parked at 05:00 through the spoken lead-in
  // and only starts ticking once breathing begins.
  const secondsLeft = state.practiceSecondsLeft;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const activeColor = state.resting || !state.started ? COLORS.accent : PHASE_COLORS[state.phase];

  // SVG circle params (viewBox units).
  const cx = 200, cy = 200, r = 155;

  // One ring = one breath. Segments are sized by phase duration starting at 12 o'clock,
  // and the dot is placed by cycle progress against the SAME scale — so the dot is always
  // physically on top of the segment for the phase currently being counted down.
  const phases = activePhases(spec);
  const cycle = cycleSeconds(spec);
  const segments: Array<{ key: typeof phases[number]; startDeg: number; endDeg: number; midDeg: number; color: string }> = [];
  let runDeg = 0;
  for (const key of phases) {
    const span = (spec.pattern[key] / cycle) * 360;
    segments.push({
      key,
      startDeg: runDeg,
      endDeg: runDeg + span,
      midDeg: runDeg + span / 2,
      color: PHASE_COLORS[key],
    });
    runDeg += span;
  }

  const dotAngle = state.started && !state.resting ? state.cycleProgress * 360 : 0;
  const dotPos = polarToXY(cx, cy, r, dotAngle);

  // Faint outer arc tracking progress through the practice (not the lead-in).
  const progress = state.practiceProgress;

  // Centre caption tracks the same state as everything else.
  let centreLabel = phaseLabel(spec, state.phase, state.side);
  if (!state.started) centreLabel = 'GET READY';
  else if (state.resting) centreLabel = 'REST';

  // Counts the listener into the practice while the instruction is still playing.
  const leadInSecondsLeft = Math.max(0, Math.ceil(spec.leadInSec - relTime));

  /**
   * A per-phase countdown only tells you something if the phase is long enough to
   * count. At Bhastrika's and Kapalbhati's one-second phases it reads a permanent
   * "1" — noise, not information — so the word carries the cue and the moving dot
   * carries the rhythm. Lead-in and rest countdowns always show; they are real.
   */
  const phaseIsCountable = spec.pattern[state.phase] >= 2;
  const showDigit = !state.started || state.resting || state.inRoundHold || phaseIsCountable;

  const isBhramari = type === 'bhramari';
  // The humming happens on the exhale — that is when the sound plays and the
  // vibration rings radiate from the head.
  const isHumming = isBhramari && state.started && !state.resting && state.phase === 'exhale';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0px',
      position: 'relative'
    }}>
      {/* === SVG Circle Ring with phase labels ===
          Rendered at 460px against the 400-unit viewBox. */}
      <div style={{ position: 'relative', width: '460px', height: '460px' }}>
        <svg width="460" height="460" viewBox="0 0 400 400" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8dece" strokeWidth="14" />

          {/* Closing retention of a round: the ring becomes one hold-coloured track
              that fills over the retention, instead of showing the breath pattern. */}
          {state.inRoundHold && (
            <>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={activeColor} strokeWidth="14" opacity={0.22} />
              <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={activeColor}
                strokeWidth="14"
                strokeDasharray={2 * Math.PI * r}
                strokeDashoffset={(2 * Math.PI * r) * (1 - state.phaseProgress)}
                strokeLinecap="round"
                transform="rotate(-90 200 200)"
                opacity={0.8}
              />
            </>
          )}

          {/* Colour-coded phase segments — one full turn is one breath */}
          {!state.inRoundHold && segments.map((seg) => {
            const isActive = state.started && !state.resting && state.phase === seg.key;
            // Full-circle single-phase techniques can't be drawn as an arc; use a circle.
            if (seg.endDeg - seg.startDeg >= 359.9) {
              return (
                <circle
                  key={seg.key}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  opacity={isActive ? 0.75 : 0.3}
                />
              );
            }
            return (
              <path
                key={seg.key}
                d={arcPath(cx, cy, r, seg.startDeg + 1.5, seg.endDeg - 1.5)}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeLinecap="round"
                opacity={isActive ? 0.75 : 0.3}
              />
            );
          })}

          {/* Whole-technique progress overlay */}
          <circle
            cx={cx} cy={cy} r={r + 14}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * (r + 14)}
            strokeDashoffset={(2 * Math.PI * (r + 14)) * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 200 200)"
            opacity={0.55}
          />

          {/* Animated dot — same angular scale as the segments above */}
          {state.started && !state.resting && (
            <>
              <circle cx={dotPos.x} cy={dotPos.y} r={26} fill={activeColor} opacity={0.18} />
              <circle cx={dotPos.x} cy={dotPos.y} r={14} fill={activeColor} opacity={0.92} />
              <circle cx={dotPos.x} cy={dotPos.y} r={7} fill="#fff" />
            </>
          )}

          {/* Lotus figure is a watermark behind the instruction, not a focal point. */}
          <g opacity={0.16}>
            <ellipse cx={cx} cy={cy - 55} rx="18" ry="22" stroke="#8c7864" strokeWidth="2.5" fill="none" />
            <path d="M185 165 Q200 170 215 165 L228 210 C232 228 222 248 200 256 C178 248 168 228 172 210 Z" stroke="#8c7864" strokeWidth="2.5" fill="none" />
            {isBhramari ? (
              /* Hands raised to the ears — the Bhramari posture. */
              <>
                <path d="M182 174 Q146 190 150 162 Q154 148 181 147" stroke="#8c7864" strokeWidth="2.5" fill="none" />
                <path d="M218 174 Q254 190 250 162 Q246 148 219 147" stroke="#8c7864" strokeWidth="2.5" fill="none" />
              </>
            ) : (
              <path d="M172 210 L155 240 L168 258 L200 262 L232 258 L245 240 L228 210" stroke="#8c7864" strokeWidth="2.5" fill="none" />
            )}
            <path d="M148 248 C168 272 232 272 252 248 C264 268 240 284 200 284 C160 284 136 268 148 248 Z" stroke="#8c7864" strokeWidth="2.5" fill="none" />
          </g>

          {/* Bhramari: vibration radiating from the head while the hum sounds. */}
          {isHumming && [0, 1, 2].map((i) => {
            const wave = (state.phaseProgress * 2 + i / 3) % 1;
            const rr = 30 + wave * 44;
            const op = 0.45 * (1 - wave);
            return (
              <g key={`hum-wave-${i}`} opacity={op}>
                <path d={arcPath(cx, cy - 55, rr, 55, 125)} fill="none" stroke={activeColor} strokeWidth="3" strokeLinecap="round" />
                <path d={arcPath(cx, cy - 55, rr, 235, 305)} fill="none" stroke={activeColor} strokeWidth="3" strokeLinecap="round" />
              </g>
            );
          })}
        </svg>

        {/* THE instruction. This is the only live inhale/exhale cue in the frame —
            the ring labels were removed because three competing readouts made it
            unclear which one to follow. */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '2px'
        }}>
          {/* Longer cues ("FORCEFUL EXHALE") step down a size so they stay inside the ring.
              When there is no digit to show, the word takes the space instead. */}
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: showDigit
              ? (centreLabel.length > 12 ? '27px' : '34px')
              : (centreLabel.length > 12 ? '40px' : '52px'),
            fontWeight: 800,
            color: activeColor,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            textAlign: 'center',
            maxWidth: '330px',
          }}>
            {centreLabel}
          </div>
          {showDigit && (
            <div style={{
              fontFamily: FONT_DISPLAY,
              fontSize: '92px',
              fontWeight: 700,
              color: activeColor,
              lineHeight: 1
            }}>
              {!state.started
                ? leadInSecondsLeft
                : state.resting ? state.restSecondsLeft : state.phaseSecondsLeft}
            </div>
          )}
          {/* Traditional name, secondary to the plain-English cue above. */}
          {state.started && !state.resting && PHASE_SANSKRIT[state.phase] && (
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: '13px',
              fontWeight: 700,
              color: activeColor,
              opacity: 0.7,
              letterSpacing: '0.18em',
            }}>
              {PHASE_SANSKRIT[state.phase]}
            </div>
          )}
        </div>
      </div>

      {/* Secondary: how long is left in the technique overall. */}
      <div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '14px', marginTop: '4px'
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '48px',
          fontWeight: 700,
          color: COLORS.ink,
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}>
          {timeFormatted}
        </div>
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '13px',
          fontWeight: 800,
          color: COLORS.accent,
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
        }}>
          REMAINING
        </div>
      </div>
    </div>
  );
};

export default CircularTimer;
