import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

interface RestCardProps {
  startSec?: number;
  durationInSeconds?: number;
  nextTechniqueTitle: string;
}

export const RestCard: React.FC<RestCardProps> = ({
  startSec = 0,
  durationInSeconds = 30,
  nextTechniqueTitle
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Calculate relative time during rest interval
  const relTime = startSec > 0 ? Math.max(0, currentTime - startSec) : currentTime % durationInSeconds;
  const secondsLeft = Math.max(0, Math.ceil(durationInSeconds - relTime));

  // Breathing expansion guide (6s cycle), counted from the START of the rest so the
  // guide circle and the countdown begin together instead of at an arbitrary phase.
  const breathCycle = (relTime % 6) / 6;
  const breathRadius = interpolate(Math.sin(breathCycle * Math.PI * 2), [-1, 1], [90, 140]);
  const breathLabel = breathCycle < 0.5 ? 'GENTLY INHALE...' : 'SLOWLY EXHALE...';

  return (
    <div style={{
      width: '1060px',
      height: '520px',
      backgroundColor: 'rgba(255, 253, 248, 0.60)',
      border: '2px solid rgba(255, 255, 255, 0.85)',
      outline: `1px solid ${COLORS.accent2}40`,
      borderRadius: '28px',
      padding: '40px 48px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 24px 60px rgba(122, 106, 88, 0.16)',
      backdropFilter: 'blur(30px) saturate(180%)'
    }}>
      {/* Left Column: Rest Notice & Countdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          backgroundColor: 'rgba(207, 168, 100, 0.15)',
          border: `1.5px solid ${COLORS.accent2}50`,
          borderRadius: '12px',
          padding: '6px 18px',
          fontSize: '14px',
          fontFamily: FONT_BODY,
          letterSpacing: '0.12em',
          color: COLORS.accent,
          fontWeight: 800,
          width: 'fit-content',
          textTransform: 'uppercase'
        }}>
          REST & RECOVER INTERVAL
        </div>

        <div style={{ fontFamily: FONT_DISPLAY, fontSize: '44px', fontWeight: 700, color: COLORS.ink, lineHeight: 1.1 }}>
          Relax & Normalize Breath
        </div>

        <div style={{ fontFamily: FONT_BODY, fontSize: '20px', color: COLORS.ink, opacity: 0.8, maxWidth: '440px' }}>
          Keep your eyes closed. Observe the peaceful sensation in your head, chest, and body.
        </div>

        {/* Digital Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: '64px', fontWeight: 700, color: COLORS.accent2 }}>
            00:{secondsLeft < 10 ? '0' : ''}{secondsLeft}
          </span>
          <span style={{ fontFamily: FONT_BODY, fontSize: '18px', color: COLORS.accent, fontWeight: 600 }}>
            SECONDS REST
          </span>
        </div>

        {/* Up Next Preview Pill */}
        <div style={{
          marginTop: '10px',
          fontFamily: FONT_BODY,
          fontSize: '17px',
          color: COLORS.ink,
          fontWeight: 600,
          backgroundColor: 'rgba(255, 255, 255, 0.70)',
          borderRadius: '14px',
          padding: '12px 20px',
          border: `1px solid ${COLORS.line}`
        }}>
          👉 UP NEXT: <span style={{ color: COLORS.accent, fontWeight: 700 }}>{nextTechniqueTitle}</span>
        </div>
      </div>

      {/* Right Column: Breathing Guide Circle */}
      <div style={{ width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width="320" height="320">
          <circle cx="160" cy="160" r="140" stroke={`${COLORS.accent2}30`} strokeWidth="2" strokeDasharray="4 4" fill="none" />
          <circle cx="160" cy="160" r={breathRadius} stroke={COLORS.accent2} strokeWidth="3" fill={`${COLORS.accent2}18`} />
        </svg>
        <div style={{
          position: 'absolute',
          fontFamily: FONT_BODY,
          fontSize: '16px',
          fontWeight: 700,
          color: COLORS.ink,
          letterSpacing: '0.1em',
          textAlign: 'center'
        }}>
          {breathLabel}
        </div>
      </div>
    </div>
  );
};

export default RestCard;
