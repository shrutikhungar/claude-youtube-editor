import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

interface PranayamCardProps {
  number: number;
  title: string;
  sanskritName: string;
  durationMinutes: string | number;
  instructions: string[];
}

export const PranayamCard: React.FC<PranayamCardProps> = ({
  number,
  title,
  sanskritName,
  durationMinutes,
  instructions,
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
      width: '840px',
      height: '710px',
      opacity,
      transform: `translateY(${translateY}px)`,
      backgroundColor: 'rgba(255, 253, 248, 0.75)',
      border: '2px solid rgba(255, 255, 255, 0.90)',
      outline: '1px solid rgba(207, 168, 100, 0.35)',
      borderRadius: '36px',
      padding: '44px 52px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 20px 50px rgba(122, 106, 88, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(30px) saturate(180%)',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Section */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Technique Badge */}
        <div style={{
          backgroundColor: '#cfa864',
          color: '#ffffff',
          fontFamily: FONT_BODY,
          fontSize: '14px',
          fontWeight: 800,
          padding: '6px 18px',
          borderRadius: '20px',
          letterSpacing: '0.12em',
          width: 'fit-content',
          textTransform: 'uppercase',
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(207, 168, 100, 0.3)'
        }}>
          TECHNIQUE {number} OF 5
        </div>

        {/* Huge Serif Title */}
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '56px',
          fontWeight: 700,
          color: '#2b2520',
          lineHeight: 1.05,
          letterSpacing: '0.01em',
          marginBottom: '10px',
          textTransform: 'uppercase'
        }}>
          {title}
        </div>

        {/* Subtitle with Lotus Icon */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span style={{ fontSize: '20px' }}>🪷</span>
          <span style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '26px',
            fontStyle: 'italic',
            color: '#cfa864',
            fontWeight: 500
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
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '15px' }}>🕒</span>
          <span style={{ fontFamily: FONT_BODY, fontSize: '14px', fontWeight: 800, color: '#7a6a58', letterSpacing: '0.12em' }}>
            {durationMinutes} MINUTES
          </span>
        </div>

        {/* Thin Gold Divider with Center Dot */}
        <div style={{ position: 'relative', width: '100%', height: '1px', backgroundColor: 'rgba(207, 168, 100, 0.35)', marginBottom: '24px' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {instructions.map((inst, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#cfa864',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(207, 168, 100, 0.25)'
            }}>
              {stepIcons[idx % stepIcons.length]}
            </div>
            <span style={{
              fontFamily: FONT_BODY,
              fontSize: '20px',
              color: '#2b2520',
              fontWeight: 600,
              lineHeight: 1.3
            }}>
              {inst}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Caution Footnote Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
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
          fontSize: '15px',
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
