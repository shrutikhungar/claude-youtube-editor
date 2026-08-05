import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

interface PranayamCardProps {
  number: number;
  title: string;
  sanskritName: string;
  durationMinutes: string | number;
  instructions: string[];
  illustrationImage?: string;
  illustrationCaption?: string;
}

export const PranayamCard: React.FC<PranayamCardProps> = ({
  number,
  title,
  sanskritName,
  durationMinutes,
  instructions,
  illustrationImage,
  illustrationCaption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Spring entrance transition
  const opacity = interpolate(currentTime, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(currentTime, [0, 0.5], [24, 0], { extrapolateRight: 'clamp' });

  // 5 Custom Icons for instructions
  const stepIcons = ['🧘', '🫁', '💨', '〰️', '👁️'];

  return (
    <div style={{
      // Fills whichever column it is dropped into — never a fixed pixel box, which
      // is what used to get clipped by the narrower left column.
      width: '100%',
      height: '100%',
      minWidth: 0,
      opacity,
      transform: `translateY(${translateY}px)`,
      backgroundColor: 'rgba(255, 253, 248, 0.75)',
      border: '2px solid rgba(255, 255, 255, 0.90)',
      outline: '1px solid rgba(207, 168, 100, 0.35)',
      borderRadius: '32px',
      padding: '30px 34px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '18px',
      boxShadow: '0 20px 50px rgba(122, 106, 88, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(30px) saturate(180%)',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Top Header Section */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Technique Badge */}
        <div style={{
          backgroundColor: '#cfa864',
          color: '#ffffff',
          fontFamily: FONT_BODY,
          fontSize: '13px',
          fontWeight: 800,
          padding: '6px 16px',
          borderRadius: '20px',
          letterSpacing: '0.12em',
          width: 'fit-content',
          textTransform: 'uppercase',
          marginBottom: '14px',
          boxShadow: '0 4px 12px rgba(207, 168, 100, 0.3)'
        }}>
          TECHNIQUE {number} OF 5
        </div>

        {/* Huge Serif Title — wraps inside the column instead of running past it */}
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '42px',
          fontWeight: 700,
          color: '#2b2520',
          lineHeight: 1.06,
          letterSpacing: '0.01em',
          marginBottom: '8px',
          textTransform: 'uppercase',
          overflowWrap: 'break-word'
        }}>
          {title}
        </div>

        {/* Subtitle with Lotus Icon */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', minWidth: 0 }}>
          <span style={{ fontSize: '18px', lineHeight: 1.4, flexShrink: 0 }}>🪷</span>
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '22px',
            fontStyle: 'italic',
            color: '#cfa864',
            fontWeight: 500,
            lineHeight: 1.25,
            minWidth: 0
          }}>
            {sanskritName}
          </span>
        </div>

        {/* Duration Badge */}
        <div style={{
          backgroundColor: '#eddcc4',
          border: '1px solid rgba(207, 168, 100, 0.4)',
          borderRadius: '16px',
          padding: '6px 16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          width: 'fit-content',
          marginBottom: '18px'
        }}>
          <span style={{ fontSize: '14px' }}>🕒</span>
          <span style={{ fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 800, color: '#7a6a58', letterSpacing: '0.12em' }}>
            {durationMinutes} MINUTES
          </span>
        </div>

        {/* Thin Gold Divider with Center Dot */}
        <div style={{ position: 'relative', width: '100%', height: '1px', backgroundColor: 'rgba(207, 168, 100, 0.35)', flexShrink: 0 }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#cfa864'
          }} />
        </div>
      </div>

      {/* Step-by-Step Instructions List (5 Items with Icons) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
        {instructions.map((inst, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '14px', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#cfa864',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(207, 168, 100, 0.25)'
            }}>
              {stepIcons[idx % stepIcons.length]}
            </div>
            <span style={{
              fontFamily: FONT_BODY,
              fontSize: '18px',
              color: '#2b2520',
              fontWeight: 600,
              lineHeight: 1.32,
              paddingTop: '4px',
              minWidth: 0,
              overflowWrap: 'break-word'
            }}>
              {inst}
            </span>
          </div>
        ))}
      </div>

      {/* Optional Technique Illustration Card (e.g. Shanmukhi Mudra or Bandha Diagram) */}
      {illustrationImage && (
        <div style={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1.5px solid rgba(207, 168, 100, 0.45)',
          borderRadius: '20px', padding: '10px 14px',
          boxShadow: '0 6px 20px rgba(122, 106, 88, 0.08)',
          flexShrink: 0
        }}>
          <Img
            src={staticFile(illustrationImage)}
            style={{
              width: '84px', height: '74px', borderRadius: '12px', objectFit: 'contain',
              border: '1px solid rgba(207,168,100,0.3)', backgroundColor: '#fff'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '10px', fontWeight: 800, color: COLORS.accent, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              TECHNIQUE POSTURE
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '15px', fontWeight: 700, color: '#2b2520', lineHeight: 1.25, marginTop: '2px' }}>
              {illustrationCaption || 'Correct Alignment'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Caution Footnote Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        {/* Divider with Lotus Icon */}
        <div style={{ position: 'relative', width: '100%', height: '1px', backgroundColor: 'rgba(207, 168, 100, 0.35)', marginBottom: '14px' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 253, 248, 0.95)',
            padding: '0 8px',
            fontSize: '14px'
          }}>
            🪷
          </div>
        </div>

        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#a38760',
          textAlign: 'center',
          lineHeight: 1.35
        }}>
          Do not strain. Practice within your comfort.<br />
          Stop if you feel dizzy or uncomfortable.
        </div>
      </div>
    </div>
  );
};

export default PranayamCard;
