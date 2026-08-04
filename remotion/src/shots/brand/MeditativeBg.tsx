import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';

export const compositionConfig = { 
  id: 'MeditativeBg', 
  durationInSeconds: 3600, 
  fps: 30, 
  width: 1920, 
  height: 1080 
};

export const MeditativeBg: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle breathing pulse (6 second cycle)
  const pulse = Math.sin((frame / 30) * (Math.PI / 3)) * 0.05 + 1.0;
  const opacityPulse = Math.sin((frame / 30) * (Math.PI / 4)) * 0.15 + 0.85;

  return (
    <AbsoluteFill style={{ 
      backgroundColor: COLORS.paper, // #e4d5c3 warm taupe
      overflow: 'hidden'
    }}>
      {/* Soft central radiant glow */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '45%',
        width: '1200px',
        height: '1200px',
        transform: `translate(-50%, -50%) scale(${pulse})`,
        background: `radial-gradient(circle, ${COLORS.cream} 0%, rgba(228, 213, 195, 0) 70%)`,
        opacity: opacityPulse,
        filter: 'blur(40px)',
      }} />

      {/* Subtle organic accent wash */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '1000px',
        height: '1000px',
        background: `radial-gradient(circle, ${COLORS.accent2}15 0%, transparent 70%)`,
        filter: 'blur(60px)',
      }} />
    </AbsoluteFill>
  );
};

export default MeditativeBg;
