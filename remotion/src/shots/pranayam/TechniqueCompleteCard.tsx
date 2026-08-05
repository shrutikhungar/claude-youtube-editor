import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

interface TechniqueCompleteCardProps {
  /** Absolute second at which the flash begins. */
  startSec: number;
  durationSec: number;
  /** 1-based position in the session. */
  index: number;
  total: number;
  /** English technique name, e.g. "Skull Shining Breath". */
  title: string;
  /** How many reps were completed. */
  count: number;
  /** BREATHS / STROKES / CYCLES. */
  unit: string;
  isFinal?: boolean;
}

/**
 * Full-screen congratulation flash shown the moment a technique finishes.
 * Deliberately layered above the global brand banner (z-index 9999) so it reads as a
 * true full-screen moment rather than an overlay inside the stage.
 */
export const TechniqueCompleteCard: React.FC<TechniqueCompleteCardProps> = ({
  startSec,
  durationSec,
  index,
  total,
  title,
  count,
  unit,
  isFinal = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = Math.max(0, frame / fps - startSec);

  const backdrop = interpolate(
    rel,
    [0, 0.3, durationSec - 0.9, durationSec],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const pop = spring({
    frame: Math.max(0, frame - Math.round(startSec * fps)),
    fps,
    config: { damping: 13, mass: 0.7, stiffness: 110 },
  });

  // The number counts up rather than just appearing — it earns the moment.
  const shown = Math.round(
    interpolate(rel, [0.35, 1.9], [0, count], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );

  // Slow rotating burst behind the number.
  const rayRotation = rel * 8;
  const rayPulse = interpolate(rel, [0, 1.2], [0.7, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      zIndex: 99999,
      opacity: backdrop,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 45%, rgba(255,253,248,0.99) 0%, rgba(247,236,219,0.99) 45%, rgba(236,220,196,0.99) 100%)',
      pointerEvents: 'none',
    }}>
      {/* Radiating burst */}
      <svg
        width="1100"
        height="1100"
        viewBox="0 0 400 400"
        style={{ position: 'absolute', opacity: 0.22 * rayPulse, transform: `rotate(${rayRotation}deg)` }}
      >
        {/* Rays start well outside the text block — drawn from the centre they sliced
            straight through the wording. */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const long = i % 2 === 0;
          const rad = (angle - 90) * Math.PI / 180;
          const inner = 152;
          const outer = long ? 196 : 176;
          return (
            <line
              key={i}
              x1={200 + inner * Math.cos(rad)}
              y1={200 + inner * Math.sin(rad)}
              x2={200 + outer * Math.cos(rad)}
              y2={200 + outer * Math.sin(rad)}
              stroke={COLORS.accent}
              strokeWidth={long ? 3 : 1.6}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div style={{
        transform: `scale(${0.86 + pop * 0.14})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '68px', lineHeight: 1 }}>{isFinal ? '🪷' : '🎉'}</div>

        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '15px',
          fontWeight: 800,
          color: COLORS.accent,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
        }}>
          {isFinal ? 'SESSION COMPLETE' : `TECHNIQUE ${index} OF ${total} COMPLETE`}
        </div>

        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '76px',
          fontWeight: 700,
          color: '#2b2520',
          letterSpacing: '0.02em',
          lineHeight: 1.05,
        }}>
          {isFinal ? 'BEAUTIFULLY DONE' : 'WELL DONE!'}
        </div>

        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '30px',
          fontStyle: 'italic',
          fontWeight: 500,
          color: COLORS.accent,
          marginTop: '-2px',
        }}>
          {title}
        </div>

        {/* Gold divider with a centre dot */}
        <div style={{ position: 'relative', width: '360px', height: '1px', backgroundColor: 'rgba(207,168,100,0.5)', margin: '16px 0 6px' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '7px', height: '7px', borderRadius: '50%', backgroundColor: COLORS.accent,
          }} />
        </div>

        {/* Solid gold badge so the number is the loudest thing on screen. */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: '20px',
          background: 'linear-gradient(135deg, #dcbc7c 0%, #cfa864 55%, #b88f4c 100%)',
          border: '3px solid #fffef7',
          borderRadius: '28px',
          padding: '10px 46px 16px',
          boxShadow: '0 18px 44px rgba(122,106,88,0.35)',
        }}>
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '132px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1,
            textShadow: '0 3px 6px rgba(90,70,40,0.30)',
          }}>
            {shown}
          </span>
          <span style={{
            fontFamily: FONT_BODY,
            fontSize: '30px',
            fontWeight: 800,
            color: 'rgba(255,253,245,0.95)',
            letterSpacing: '0.16em',
          }}>
            {unit}
          </span>
        </div>

        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '17px',
          fontWeight: 700,
          color: '#7a6a58',
          letterSpacing: '0.08em',
          marginTop: '6px',
        }}>
          {isFinal ? 'All five techniques complete. Carry this calm with you.' : 'Relax and let the breath settle.'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default TechniqueCompleteCard;
