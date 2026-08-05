import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

interface ShanmukhiMudraDiagramProps {
  /** Absolute second the technique slot begins — the animation runs from here. */
  startSec: number;
}

/**
 * The six placements of Shanmukhi Mudra ("the seal of the six gates"), in the order
 * the hands actually take them. `pts` are the two symmetric fingertip positions.
 */
const PLACEMENTS = [
  { digit: 'THUMBS', where: 'Close the ears', pts: [[86, 152], [254, 152]] },
  { digit: 'INDEX FINGERS', where: 'Rest on closed eyelids', pts: [[141, 133], [199, 133]] },
  { digit: 'MIDDLE FINGERS', where: 'Lightly beside the nostrils', pts: [[155, 181], [185, 181]] },
  { digit: 'RING FINGERS', where: 'Just above the upper lip', pts: [[157, 201], [183, 201]] },
  { digit: 'LITTLE FINGERS', where: 'Just below the lower lip', pts: [[157, 222], [183, 222]] },
] as const;

const STEP_SEC = 3.0;
const CYCLE_SEC = STEP_SEC * (PLACEMENTS.length + 1); // each digit, then all together

export const ShanmukhiMudraDiagram: React.FC<ShanmukhiMudraDiagramProps> = ({ startSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = Math.max(0, frame / fps - startSec);

  const step = Math.floor((rel % CYCLE_SEC) / STEP_SEC);
  const allSix = step >= PLACEMENTS.length;
  const stepProgress = ((rel % CYCLE_SEC) % STEP_SEC) / STEP_SEC;
  const pulse = 0.55 + 0.45 * Math.sin(stepProgress * Math.PI);

  const enter = interpolate(rel, [0, 0.6], [0, 1], { extrapolateRight: 'clamp' });
  const active = allSix ? PLACEMENTS.length : step;

  return (
    <div style={{
      flex: 1,
      width: '100%',
      minHeight: 0,
      opacity: enter,
      backgroundColor: 'rgba(255, 253, 248, 0.90)',
      border: '1.5px solid rgba(207, 168, 100, 0.40)',
      borderRadius: '28px',
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 16px 40px rgba(122, 106, 88, 0.12)',
      backdropFilter: 'blur(24px)',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 800, color: COLORS.accent,
        letterSpacing: '0.22em', textTransform: 'uppercase', flexShrink: 0,
      }}>
        SHANMUKHI MUDRA
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Framed tight to the face so it fills the panel rather than floating in it. */}
        <svg viewBox="76 42 188 218" style={{ width: '100%', height: '100%' }}>
          <g fill="none" stroke="#c4b3a0" strokeWidth="2.5" strokeLinecap="round">
            {/* face + ears */}
            <ellipse cx="170" cy="152" rx="76" ry="94" />
            <path d="M94 132 q-14 4 -12 22 q2 16 14 16" />
            <path d="M246 132 q14 4 12 22 q-2 16 -14 16" />
            {/* closed eyes */}
            <path d="M128 133 q13 9 26 0" />
            <path d="M186 133 q13 9 26 0" />
            {/* brows */}
            <path d="M126 116 q13 -7 27 -2" />
            <path d="M187 114 q14 -5 27 2" />
            {/* nose */}
            <path d="M170 140 l-6 34 q6 5 12 0" />
            {/* lips */}
            <path d="M150 210 q20 -9 40 0 q-20 13 -40 0 Z" />
          </g>

          {/* fingertip placements */}
          {PLACEMENTS.map((p, i) => {
            const on = allSix || step === i;
            const glow = on ? (allSix ? 0.75 : pulse) : 0;
            return (
              <g key={p.digit}>
                {p.pts.map(([cx, cy]) => (
                  <g key={`${p.digit}-${cx}`}>
                    <circle cx={cx} cy={cy} r={15} fill={COLORS.accent2} opacity={0.22 * glow} />
                    <circle
                      cx={cx} cy={cy} r={on ? 7.5 : 4.5}
                      fill={on ? COLORS.accent2 : '#d3c5b3'}
                      stroke="#fffdf8" strokeWidth="1.5"
                    />
                  </g>
                ))}
              </g>
            );
          })}

        </svg>
      </div>

      <div style={{
        flexShrink: 0,
        backgroundColor: allSix ? 'rgba(207,168,100,0.18)' : 'rgba(255,255,255,0.65)',
        border: `1.5px solid ${allSix ? COLORS.accent2 : 'rgba(207,168,100,0.30)'}`,
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'center',
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: '17px', fontWeight: 700, color: COLORS.ink, lineHeight: 1.2 }}>
          {allSix ? 'ALL SIX GATES CLOSED' : PLACEMENTS[active].digit}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 600, color: '#7a6a58' }}>
          {allSix ? 'Ears, eyes, nostrils and mouth sealed' : PLACEMENTS[active].where}
        </div>
      </div>
    </div>
  );
};

export default ShanmukhiMudraDiagram;
