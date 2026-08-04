import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../brand';

interface PranayamArtProps {
  type: 'bhastrika' | 'kapalbhati' | 'anulom_vilom' | 'bahya' | 'bhramari';
}

export const PranayamArt: React.FC<PranayamArtProps> = ({ type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Breathing chest light pulse
  const pulse = Math.sin((currentTime * Math.PI * 2) / 4);
  const chestGlowScale = interpolate(pulse, [-1, 1], [0.85, 1.2]);
  const chestOpacity = interpolate(pulse, [-1, 1], [0.65, 0.95]);

  // Anulom Vilom Nostril Flow Calculations (32s full cycle)
  // 1:4:2 ratio: Inhale L (4s) -> Hold (16s) -> Exhale R (8s) -> Hold (4s) -> Inhale R (4s) -> Hold (16s) -> Exhale L (8s) -> Hold (4s)
  const avCycleDuration = 64;
  const avTime = currentTime % avCycleDuration;

  let isAvInhaleLeft = false;
  let isAvHold1 = false;
  let isAvExhaleRight = false;
  let isAvHold2 = false;
  let isAvInhaleRight = false;
  let isAvHold3 = false;
  let isAvExhaleLeft = false;
  let isAvHold4 = false;

  if (avTime < 4) isAvInhaleLeft = true;
  else if (avTime < 20) isAvHold1 = true;
  else if (avTime < 28) isAvExhaleRight = true;
  else if (avTime < 32) isAvHold2 = true;
  else if (avTime < 36) isAvInhaleRight = true;
  else if (avTime < 52) isAvHold3 = true;
  else if (avTime < 60) isAvExhaleLeft = true;
  else isAvHold4 = true;

  const isAvHolding = isAvHold1 || isAvHold2 || isAvHold3 || isAvHold4;

  // Dynamic particle positions for Air Flow Animation
  const pranaParticlePhase = (frame % 30) / 30;
  const leftFlowY = isAvInhaleLeft ? interpolate(pranaParticlePhase, [0, 1], [88, 62]) : interpolate(pranaParticlePhase, [0, 1], [62, 88]);
  const rightFlowY = isAvInhaleRight ? interpolate(pranaParticlePhase, [0, 1], [88, 62]) : interpolate(pranaParticlePhase, [0, 1], [62, 88]);

  return (
    <div style={{
      width: '260px',
      height: '240px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <svg width="240" height="220" viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Delicate Aura Circle */}
        <circle cx="120" cy="110" r="95" stroke="#cfa864" strokeWidth="1" strokeDasharray="3 3" opacity={0.4} />

        {/* Lotus Seated Figure Silhouette (Golden Fine Stroke) */}
        {/* Head */}
        <ellipse cx="120" cy="62" rx="15" ry="18" stroke="#8c7864" strokeWidth="2" fill="none" />

        {/* Neck & Shoulders */}
        <path d="M113 79 Q120 82 127 79 L142 115 C146 130 138 148 120 156 C102 148 94 130 98 115 Z" stroke="#8c7864" strokeWidth="2" fill="none" />

        {/* Arms Resting on Knees */}
        <path d="M98 115 L82 142 L95 160 L120 164 L145 160 L158 142 L142 115" stroke="#8c7864" strokeWidth="2" fill="none" />

        {/* Crossed Lotus Legs Base */}
        <path d="M72 152 C90 172 150 172 168 152 C180 170 155 186 120 186 C85 186 60 170 72 152 Z" stroke="#8c7864" strokeWidth="2" fill="none" />

        {/* Heart / Chest Glowing Prana Light (Soft Gold Pulse) */}
        <circle cx="120" cy="115" r={16 * chestGlowScale} fill="#cfa864" opacity={chestOpacity * 0.45} />
        <circle cx="120" cy="115" r={8 * chestGlowScale} fill="#e6c485" opacity={chestOpacity} />

        {/* Dynamic Energy Accent per Technique */}
        {type === 'kapalbhati' && (
          <path d="M120 115 L120 62" stroke="#cfa864" strokeWidth="2" strokeDasharray="4 3" opacity={0.8} />
        )}

        {/* --- ANULOM VILOM INTERACTIVE NOSTRIL PRANA FLOW ANIMATION --- */}
        {type === 'anulom_vilom' && (
          <g>
            {/* Nostril Indicators */}
            <text x="82" y="66" fill="#7a6a58" fontSize="10" fontFamily="sans-serif" fontWeight="bold">LEFT</text>
            <text x="144" y="66" fill="#7a6a58" fontSize="10" fontFamily="sans-serif" fontWeight="bold">RIGHT</text>

            {/* Left Nostril Air Stream (Inhale L or Exhale L) */}
            {(isAvInhaleLeft || isAvExhaleLeft) && (
              <g>
                <path d="M108 88 L108 62" stroke="#cfa864" strokeWidth="2.5" strokeDasharray="4 3" opacity={0.85} />
                <circle cx="108" cy={leftFlowY} r="4" fill="#cfa864" />
                <circle cx="108" cy={leftFlowY} r="8" fill="#cfa864" opacity="0.3" />
              </g>
            )}

            {/* Right Nostril Air Stream (Inhale R or Exhale R) */}
            {(isAvInhaleRight || isAvExhaleRight) && (
              <g>
                <path d="M132 88 L132 62" stroke="#cfa864" strokeWidth="2.5" strokeDasharray="4 3" opacity={0.85} />
                <circle cx="132" cy={rightFlowY} r="4" fill="#cfa864" />
                <circle cx="132" cy={rightFlowY} r="8" fill="#cfa864" opacity="0.3" />
              </g>
            )}

            {/* Crown / Ajna Third Eye Holding Aura during Kumbhaka */}
            {isAvHolding && (
              <g>
                <circle cx="120" cy="56" r="14" fill="#cfa864" opacity={0.35} />
                <circle cx="120" cy="56" r="7" fill="#fce8b3" />
                <text x="120" y="40" textAnchor="middle" fill="#7a6a58" fontSize="9" fontFamily="sans-serif" fontWeight="bold">KUMBHAKA</text>
              </g>
            )}
          </g>
        )}

        {type === 'bahya' && (
          <g>
            <circle cx="120" cy="80" r="6" fill="#cfa864" opacity={0.8} />
            <circle cx="120" cy="120" r="8" fill="#cfa864" opacity={0.8} />
            <circle cx="120" cy="165" r="6" fill="#cfa864" opacity={0.8} />
          </g>
        )}

        {type === 'bhramari' && (
          <circle cx="120" cy="62" r="28" stroke="#cfa864" strokeWidth="1" strokeDasharray="2 2" opacity={0.6} />
        )}
      </svg>
    </div>
  );
};

export default PranayamArt;
