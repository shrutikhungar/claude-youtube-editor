import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion';
import { COLORS } from '../../brand';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  maxOpacity: number;
  pulsePhase: number;
  color: string;
}

export const SparkleParticlesOverlay: React.FC<{ count?: number }> = ({ count = 35 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Generate deterministic particles so there is zero flicker between frames
  const particles = useMemo(() => {
    const pList: Particle[] = [];
    const colors = ['#cfa864', '#7a6a58', '#d4a359', '#b8860b', '#ffffff'];
    for (let i = 0; i < count; i++) {
      // Use simple pseudo-random generator based on index
      const seed1 = Math.sin(i * 9999 + 1) * 10000;
      const seed2 = Math.sin(i * 8888 + 2) * 10000;
      const seed3 = Math.sin(i * 7777 + 3) * 10000;
      const r1 = seed1 - Math.floor(seed1);
      const r2 = seed2 - Math.floor(seed2);
      const r3 = seed3 - Math.floor(seed3);

      pList.push({
        x: r1 * width,
        y: r2 * height,
        size: 6 + r3 * 8, // 6px to 14px size
        speed: 0.8 + r1 * 1.4,
        sway: 20 + r2 * 40,
        maxOpacity: 0.65 + r3 * 0.30, // 0.65 to 0.95 high opacity
        pulsePhase: r1 * Math.PI * 2,
        color: colors[i % colors.length]
      });
    }
    return pList;
  }, [count, width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 15 }}>
      {particles.map((p, idx) => {
        // Continuous upward floating with wrapping
        const totalY = (p.y - (frame * p.speed)) % height;
        const currentY = totalY < 0 ? totalY + height : totalY;

        // Subtle side-to-side sway
        const currentX = p.x + Math.sin((frame / 45) + p.pulsePhase) * p.sway;

        // Soft pulsing opacity
        const pulse = (Math.sin((frame / 25) + p.pulsePhase) + 1) / 2;
        const opacity = interpolate(pulse, [0, 1], [0.35, p.maxOpacity]);

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: `${currentY}px`,
              left: `${currentX}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 3}px rgba(207, 168, 100, 0.6)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export default SparkleParticlesOverlay;
