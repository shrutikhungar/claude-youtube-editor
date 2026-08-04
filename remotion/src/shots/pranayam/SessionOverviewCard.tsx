import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

export const SessionOverviewCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.8, stiffness: 120 }
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const techniques = [
    { num: 1, title: 'BHASTRIKA PRANAYAMA', subtitle: 'Bellows Breathing', time: '5.0 MIN', icon: '🫁' },
    { num: 2, title: 'KAPALBHATI PRANAYAMA', subtitle: 'Skull Shining Breath', time: '5.0 MIN', icon: '🔥' },
    { num: 3, title: 'ANULOM VILOM', subtitle: 'Alternate Nostril Breathing', time: '5.0 MIN', icon: '🌿' },
    { num: 4, title: 'BAHYA PRANAYAMA', subtitle: 'External Breath Retention', time: '5.0 MIN', icon: '🌬️' },
    { num: 5, title: 'BHRAMARI PRANAYAMA', subtitle: 'Humming Bee Breath', time: '5.0 MIN', icon: '🐝' },
  ];

  return (
    <div style={{
      width: '1440px',
      height: '710px',
      backgroundColor: 'rgba(255, 253, 248, 0.95)',
      border: '2.5px solid rgba(207, 168, 100, 0.60)',
      borderRadius: '32px',
      padding: '40px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 24px 60px rgba(122, 106, 88, 0.18)',
      backdropFilter: 'blur(30px)',
      transform: `scale(${scale})`,
      opacity
    }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '14px',
          fontWeight: 800,
          color: COLORS.accent,
          letterSpacing: '0.22em',
          textTransform: 'uppercase'
        }}>
          SOULFUL INTELLIGENCE STUDIO • DAILY PRACTICE
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '44px',
          fontWeight: 700,
          color: COLORS.ink,
          letterSpacing: '0.02em'
        }}>
          DAILY 5 PRANAYAM SESSION OVERVIEW
        </div>
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '16px',
          color: COLORS.accent,
          fontWeight: 700,
          backgroundColor: 'rgba(207, 168, 100, 0.12)',
          border: '1px solid rgba(207, 168, 100, 0.35)',
          borderRadius: '16px',
          padding: '6px 20px',
          marginTop: '4px'
        }}>
          🕒 TOTAL DURATION: 28 MINUTES (5 MIN PER TECHNIQUE + 30 SEC RECOVERY BREAKS)
        </div>
      </div>

      {/* 5 Techniques List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '1200px' }}>
        {techniques.map((tech) => (
          <div key={tech.num} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: '1.5px solid rgba(207, 168, 100, 0.30)',
            borderRadius: '20px',
            padding: '16px 28px',
            boxShadow: '0 8px 20px rgba(122, 106, 88, 0.06)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: COLORS.accent,
                color: '#ffffff',
                fontFamily: FONT_DISPLAY,
                fontSize: '18px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {tech.num}
              </div>
              <div style={{ fontSize: '28px' }}>{tech.icon}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: 700, color: COLORS.ink }}>
                  {tech.title}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: '14px', fontStyle: 'italic', color: COLORS.accent, fontWeight: 600 }}>
                  {tech.subtitle}
                </div>
              </div>
            </div>

            <div style={{
              fontFamily: FONT_BODY,
              fontSize: '16px',
              fontWeight: 800,
              color: COLORS.ink,
              backgroundColor: 'rgba(207, 168, 100, 0.15)',
              borderRadius: '12px',
              padding: '8px 18px',
              border: '1px solid rgba(207, 168, 100, 0.40)'
            }}>
              ⏱️ {tech.time}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Reminder */}
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: '15px',
        color: COLORS.ink,
        opacity: 0.8,
        fontStyle: 'italic'
      }}>
        🪷 "Prepare a quiet space, sit comfortably, and let us begin our daily breathwork practice."
      </div>
    </div>
  );
};

export default SessionOverviewCard;
