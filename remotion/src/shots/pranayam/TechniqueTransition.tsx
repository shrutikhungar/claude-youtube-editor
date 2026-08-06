import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill, random } from 'remotion';
import { COLORS } from '../../brand';

interface TechniqueTransitionProps {
  /** Absolute second the transition begins. */
  startSec: number;
  durationSec: number;
  /** Stable per-technique seed so each transition has its own block order. */
  seed: string;
}

const COLS = 24;
const ROWS = 14;

/**
 * Digital block wipe into a new technique.
 *
 * A grid of tiles clears in a pseudo-random order rather than a straight sweep, which
 * is what makes it read as "digital" instead of as a curtain. Deterministic: the order
 * comes from Remotion's seeded random, so the same frame always renders identically
 * and the transition is safe to re-render.
 */
export const TechniqueTransition: React.FC<TechniqueTransitionProps> = ({
  startSec,
  durationSec,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame / fps - startSec;

  if (rel < 0 || rel > durationSec) return null;

  // 0 -> 1 across the transition; tiles disappear as the front passes them.
  const progress = interpolate(rel, [0, durationSec], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Each tile leaves at its own moment: mostly left-to-right, jittered per tile.
      const order = c / COLS;
      const jitter = random(`${seed}-${r}-${c}`) * 0.45;
      const leaveAt = order * 0.55 + jitter;
      const alpha = progress < leaveAt ? 1 : 0;
      if (alpha === 0) continue;
      tiles.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: `${(c / COLS) * 100}%`,
            top: `${(r / ROWS) * 100}%`,
            width: `${100 / COLS + 0.05}%`,
            height: `${100 / ROWS + 0.05}%`,
            backgroundColor: '#f3e7d6',
          }}
        />,
      );
    }
  }

  // A thin leading edge travelling with the wipe, so the eye has something to follow.
  const edgeX = interpolate(progress, [0, 0.55], [0, 100], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ zIndex: 90000, pointerEvents: 'none' }}>
      {tiles}
      {progress < 0.6 && (
        <div style={{
          position: 'absolute',
          left: `${edgeX}%`,
          top: 0,
          bottom: 0,
          width: '3px',
          backgroundColor: COLORS.accent2,
          opacity: 0.55,
        }} />
      )}
    </AbsoluteFill>
  );
};

export default TechniqueTransition;
