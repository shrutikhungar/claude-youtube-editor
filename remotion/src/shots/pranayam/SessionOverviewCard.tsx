import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { INTRO_TECHNIQUE_MARKS, INTRO_DURATION_MARK, INTRO_HIGHLIGHT_SEC } from './introMarks';

export const SessionOverviewCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.8, stiffness: 120 }
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Each row lights up at the exact moment the narrator says its name. The timings are
  // the TTS engine's own word-boundary events (see introMarks.ts), not estimates — the
  // highlight would drift the moment the script or the speaking rate changed otherwise.
  const t = frame / fps;
  const lit = (start: number | null, len: number) => {
    if (start === null || start <= 0) return 0;
    return interpolate(
      t,
      [start - 0.2, start + 0.25, start + len - 0.45, start + len],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
  };

  // Stays lit until the next name is spoken, so the highlight travels down the list.
  const techniqueGlow = (i: number) => {
    const start = INTRO_TECHNIQUE_MARKS[i];
    const next = INTRO_TECHNIQUE_MARKS[i + 1];
    return lit(start ?? null, next ? next - start : INTRO_HIGHLIGHT_SEC);
  };

  // "…practised for a full five minutes" — every badge answers to that one phrase.
  const durationGlow = lit(INTRO_DURATION_MARK, 2.6);

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
      height: '830px',
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
          🕒 30 MINUTES • 5 MIN PRACTICE PER TECHNIQUE • GUIDED REST AFTER EVERY ROUND
        </div>
      </div>

      {/* 5 Techniques List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '1200px' }}>
        {techniques.map((tech, i) => {
          const g = techniqueGlow(i);
          return (
          <div key={tech.num} style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: `rgba(255, 253, 244, ${0.85 + 0.12 * g})`,
            border: `1.5px solid rgba(207, 168, 100, ${0.30 + 0.70 * g})`,
            borderRadius: '20px',
            padding: '16px 28px',
            transform: `scale(${1 + 0.014 * g})`,
            boxShadow: g > 0
              ? `0 8px 20px rgba(122, 106, 88, 0.06), 0 0 0 ${5 * g}px rgba(207, 168, 100, ${0.16 * g})`
              : '0 8px 20px rgba(122, 106, 88, 0.06)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: g > 0.5 ? COLORS.accent2 : COLORS.accent,
                color: '#ffffff',
                fontFamily: FONT_DISPLAY,
                fontSize: '18px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 ${14 * g}px rgba(207, 168, 100, ${0.85 * g})`,
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

            {/* Pulses when the narrator says "a full five minutes". */}
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: '16px',
              fontWeight: 800,
              color: COLORS.ink,
              backgroundColor: `rgba(207, 168, 100, ${0.15 + 0.45 * durationGlow})`,
              borderRadius: '12px',
              padding: '8px 18px',
              border: `1px solid rgba(207, 168, 100, ${0.40 + 0.60 * durationGlow})`,
              transform: `scale(${1 + 0.05 * durationGlow})`,
              boxShadow: `0 0 ${16 * durationGlow}px rgba(207, 168, 100, ${0.7 * durationGlow})`,
            }}>
              ⏱️ {tech.time}
            </div>
          </div>
          );
        })}
      </div>

      {/* Contraindication notice. Kapalbhati and Bhastrika are forceful techniques and
          this session includes breath retention, so the warning is specific about who
          should skip them rather than a generic "consult your doctor" line. */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '18px',
        backgroundColor: 'rgba(207, 168, 100, 0.14)',
        border: `1.5px solid ${COLORS.accent2}`,
        borderRadius: '18px',
        padding: '16px 24px',
        boxSizing: 'border-box',
      }}>
        <span style={{ fontSize: '30px', lineHeight: 1.1, flexShrink: 0 }}>⚠️</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', minWidth: 0 }}>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: '13px',
            fontWeight: 800,
            color: COLORS.accent,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
          }}>
            BEFORE YOU BEGIN
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: '15px', fontWeight: 600, color: COLORS.ink, lineHeight: 1.45 }}>
            Skip the forceful techniques (Bellows and Skull Shining) if you are pregnant, or have
            high blood pressure, heart disease, epilepsy, glaucoma, hernia, or recent abdominal surgery.
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: '15px', fontWeight: 600, color: COLORS.ink, lineHeight: 1.45 }}>
            Practise on an empty stomach. Never strain — if you feel dizzy, faint or breathless,
            stop and breathe normally. This is general wellness content, not medical advice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionOverviewCard;
