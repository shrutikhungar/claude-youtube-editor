import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

interface BandhaDiagramProps {
  /** Absolute second the technique slot begins — the animation runs from here. */
  startSec: number;
}

/** The three locks, top to bottom, plus the combined hold. */
const LOCKS = [
  { key: 'jalandhara', sanskrit: 'JALANDHARA', name: 'Throat lock', cue: 'Chin drawn down to the chest', y: 112 },
  { key: 'uddiyana', sanskrit: 'UDDIYANA', name: 'Abdominal lock', cue: 'Belly drawn up and back', y: 196 },
  { key: 'mula', sanskrit: 'MULA', name: 'Root lock', cue: 'Pelvic floor lifted', y: 268 },
] as const;

const STEP_SEC = 3.2;                    // each lock is highlighted in turn
const CYCLE_SEC = STEP_SEC * 4;          // three locks, then all three together

/**
 * Animated bandha reference shown while the Bahya Pranayam instructions play.
 *
 * The three locks are engaged in order — throat, abdomen, root — and the diagram
 * walks through them in that same order before showing all three held together
 * (maha bandha), which is what the technique actually asks for.
 */
export const BandhaDiagram: React.FC<BandhaDiagramProps> = ({ startSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = Math.max(0, frame / fps - startSec);

  const step = Math.floor((rel % CYCLE_SEC) / STEP_SEC); // 0,1,2 = single lock, 3 = all
  const allThree = step === 3;
  const stepProgress = ((rel % CYCLE_SEC) % STEP_SEC) / STEP_SEC;

  // Gentle pulse on whichever lock is being called out.
  const pulse = 0.55 + 0.45 * Math.sin(stepProgress * Math.PI);

  const enter = interpolate(rel, [0, 0.6], [0, 1], { extrapolateRight: 'clamp' });

  const isActive = (i: number) => allThree || step === i;

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
        fontFamily: FONT_BODY,
        fontSize: '13px',
        fontWeight: 800,
        color: COLORS.accent,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        THE THREE LOCKS
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Framed to the figure plus its labels — the default box left dead space below. */}
        <svg viewBox="14 22 322 288" style={{ width: '100%', height: '100%' }}>
          {/* --- seated figure, left --- */}
          <g fill="none" stroke="#c4b3a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* head + topknot */}
            <circle cx="96" cy="62" r="26" />
            <path d="M88 34 q8 -14 16 0" />
            {/* shoulders + torso */}
            <path d="M62 128 q34 -22 68 0 l10 96 q-44 20 -88 0 Z" />
            {/* arms resting on knees */}
            <path d="M64 136 q-30 40 -22 82" />
            <path d="M128 136 q30 40 22 82" />
            {/* crossed legs */}
            <path d="M40 232 q56 40 112 0 q14 34 -56 38 q-70 -4 -56 -38 Z" />
          </g>

          {/* --- lock markers --- */}
          {LOCKS.map((lock, i) => {
            const on = isActive(i);
            const color = on ? COLORS.accent2 : '#cdbfae';
            const glow = on ? (allThree ? 0.8 : pulse) : 0;
            return (
              <g key={lock.key}>
                {/* glow at the body */}
                <circle cx="96" cy={lock.y} r={20} fill={COLORS.accent2} opacity={0.22 * glow} />
                <circle cx="96" cy={lock.y} r={11} fill={COLORS.accent2} opacity={0.42 * glow} />
                {/* the lock band across the body */}
                <line
                  x1="52" y1={lock.y} x2="140" y2={lock.y}
                  stroke={color} strokeWidth={on ? 4 : 2.5} strokeLinecap="round"
                />
                {/* leader out to the label */}
                <line
                  x1="140" y1={lock.y} x2="182" y2={lock.y}
                  stroke={color} strokeWidth={on ? 2.4 : 1.6}
                  strokeDasharray="5 5"
                />
                <circle cx="182" cy={lock.y} r={on ? 4.5 : 3} fill={color} />

                <text
                  x="194" y={lock.y - 4}
                  fontFamily="sans-serif" fontSize="15" fontWeight="800"
                  fill={on ? COLORS.accent2 : '#a2937f'} letterSpacing="1.2"
                >
                  {lock.sanskrit}
                </text>
                <text
                  x="194" y={lock.y + 14}
                  fontFamily="sans-serif" fontSize="13" fontWeight="600"
                  fill={on ? COLORS.ink : '#b3a493'}
                >
                  {lock.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Which lock is being called out right now. */}
      <div style={{
        flexShrink: 0,
        backgroundColor: allThree ? 'rgba(207,168,100,0.18)' : 'rgba(255,255,255,0.65)',
        border: `1.5px solid ${allThree ? COLORS.accent2 : 'rgba(207,168,100,0.30)'}`,
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: '18px', fontWeight: 700, color: COLORS.ink, lineHeight: 1.2,
        }}>
          {allThree ? 'ALL THREE TOGETHER' : LOCKS[step].name}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 600, color: '#7a6a58' }}>
          {allThree ? 'Maha Bandha — the great lock' : LOCKS[step].cue}
        </div>
      </div>
    </div>
  );
};

export default BandhaDiagram;
