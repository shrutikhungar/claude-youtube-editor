import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

export const PeriodicLikeBanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Appears for 6 seconds at t = 45s, 135s, 225s, 315s, 405s, 495s
  const intervals = [45, 135, 225, 315, 405, 495];
  const activeInterval = intervals.find(t => currentTime >= t && currentTime < t + 6);

  if (!activeInterval) {
    return null;
  }

  const relTime = currentTime - activeInterval;
  const opacity = interpolate(relTime, [0, 0.5, 5.5, 6], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const translateY = interpolate(relTime, [0, 0.5, 5.5, 6], [20, 0, 0, -15], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      bottom: '125px',
      left: '50%',
      transform: `translateX(-50%) translateY(${translateY}px)`,
      opacity,
      zIndex: 500,
      pointerEvents: 'none'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 253, 248, 0.95)',
        border: '2.5px solid #cfa864',
        borderRadius: '24px',
        padding: '14px 36px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 16px 40px rgba(122, 106, 88, 0.22)',
        backdropFilter: 'blur(20px) saturate(180%)'
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '22px',
          fontWeight: 700,
          color: '#2b2520',
          letterSpacing: '0.06em'
        }}>
          👍 LIKE &nbsp;•&nbsp; 💬 COMMENT &nbsp;•&nbsp; 🔔 SUBSCRIBE
        </div>
        <div style={{
          width: '1px',
          height: '24px',
          backgroundColor: 'rgba(207, 168, 100, 0.5)'
        }} />
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '15px',
          fontWeight: 700,
          color: '#7a6a58',
          letterSpacing: '0.04em'
        }}>
          Subscribe for daily mindfulness routines! 🙏
        </div>
      </div>
    </div>
  );
};

export default PeriodicLikeBanner;
