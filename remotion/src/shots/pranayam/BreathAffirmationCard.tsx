import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { PranayamType, PRANAYAM_SPECS, resolveBreath, PhaseKey } from './breathPattern';

interface BreathAffirmationCardProps {
  startSec: number;
  type: PranayamType;
}

export const BreathAffirmationCard: React.FC<BreathAffirmationCardProps> = ({ startSec, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const relTime = currentTime - startSec;

  const spec = PRANAYAM_SPECS[type];
  const state = resolveBreath(spec, relTime);

  const phase: PhaseKey = state.started && !state.resting ? state.phase : 'inhale';

  let config = {
    icon: '🌿',
    badge: 'INHALE HEALING & POSITIVITY',
    text: 'Absorb vital oxygen, pure life force & positive healing energy into every cell.',
    color: '#3d7a52',
    bgColor: 'rgba(238, 246, 240, 0.85)',
    borderColor: 'rgba(90, 138, 106, 0.45)',
  };

  if (state.resting) {
    config = {
      icon: '🪷',
      badge: 'RELAX & RESTORE',
      text: 'Allow your breath to normalize. Feel the deep calm and natural healing within.',
      color: '#cfa864',
      bgColor: 'rgba(255, 253, 248, 0.85)',
      borderColor: 'rgba(207, 168, 100, 0.45)',
    };
  } else if (phase === 'exhale') {
    config = {
      icon: '💨',
      badge: 'EXHALE TOXINS & NEGATIVITY',
      text: 'Release all stress, physical toxins, tension and heavy thoughts out of your body.',
      color: '#2e6b9e',
      bgColor: 'rgba(238, 243, 248, 0.85)',
      borderColor: 'rgba(74, 122, 154, 0.45)',
    };
  } else if (phase === 'hold1' || phase === 'hold2') {
    config = {
      icon: '✨',
      badge: 'RETAIN PURITY & CALM',
      text: 'Let healing energy settle deeply. Feel peace and vitality flow through your entire system.',
      color: '#9e7528',
      bgColor: 'rgba(249, 245, 235, 0.85)',
      borderColor: 'rgba(160, 128, 64, 0.45)',
    };
  }

  return (
    <div style={{
      width: '100%',
      height: '110px',
      backgroundColor: config.bgColor,
      border: `1.5px solid ${config.borderColor}`,
      borderRadius: '24px',
      padding: '16px 28px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '20px',
      boxShadow: '0 12px 32px rgba(122, 106, 88, 0.08)',
      backdropFilter: 'blur(20px)',
      boxSizing: 'border-box',
      transition: 'all 0.4s ease',
      overflow: 'hidden'
    }}>
      {/* Icon Bubble */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        border: `1.5px solid ${config.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
      }}>
        {config.icon}
      </div>

      {/* Text Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '11px',
          fontWeight: 800,
          color: config.color,
          letterSpacing: '0.16em',
          textTransform: 'uppercase'
        }}>
          {config.badge}
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '18px',
          fontWeight: 600,
          color: '#2b2520',
          lineHeight: 1.25,
          letterSpacing: '0.01em'
        }}>
          "{config.text}"
        </div>
      </div>
    </div>
  );
};

export default BreathAffirmationCard;
