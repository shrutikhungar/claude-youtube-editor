import React from 'react';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

interface NextRestPreviewProps {
  title?: string;
  durationSec?: number;
}

export const NextRestPreview: React.FC<NextRestPreviewProps> = ({
  title = "30 SEC RELAXATION",
  durationSec = 30
}) => {
  return (
    <div style={{
      width: '640px',
      height: '155px',
      backgroundColor: 'rgba(255, 253, 248, 0.75)',
      border: '2px solid rgba(255, 255, 255, 0.90)',
      outline: '1px solid rgba(207, 168, 100, 0.35)',
      borderRadius: '28px',
      padding: '24px 36px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 16px 40px rgba(122, 106, 88, 0.10)',
      backdropFilter: 'blur(30px) saturate(180%)',
      boxSizing: 'border-box'
    }}>
      {/* Left Icon & Next Title */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
        {/* Leaf / Sprout Circle Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#eddcc4',
          border: '1.5px solid rgba(207, 168, 100, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px'
        }}>
          🌱
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: '14px',
            fontWeight: 800,
            color: '#7a6a58',
            letterSpacing: '0.14em',
            textTransform: 'uppercase'
          }}>
            NEXT:
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY,
            fontSize: '24px',
            fontWeight: 700,
            color: '#2b2520',
            letterSpacing: '0.02em'
          }}>
            {title}
          </div>
        </div>
      </div>

      {/* Right Hourglass Pill Badge */}
      <div style={{
        backgroundColor: '#eddcc4',
        border: '1px solid rgba(207, 168, 100, 0.4)',
        borderRadius: '20px',
        padding: '10px 22px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '18px' }}>⌛</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '20px', fontWeight: 700, color: '#7a6a58' }}>
          00:{durationSec < 10 ? '0' : ''}{durationSec}
        </span>
      </div>
    </div>
  );
};

export default NextRestPreview;
