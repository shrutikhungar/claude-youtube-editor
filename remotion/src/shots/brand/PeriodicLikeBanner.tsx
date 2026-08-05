import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

const FIRST_AT = 45;
const EVERY = 150;
const SHOW_FOR = 6;

/**
 * Shared so the header can fade its own content out underneath the banner instead of
 * being covered by it. One schedule, two consumers.
 */
export function likeBannerOpacity(currentTime: number, until: number): number {
  for (let t = FIRST_AT; t <= until - SHOW_FOR; t += EVERY) {
    if (currentTime >= t && currentTime < t + SHOW_FOR) {
      return interpolate(currentTime - t, [0, 0.5, 5.5, 6], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
    }
  }
  return 0;
}

export const PeriodicLikeBanner: React.FC<{ until: number }> = ({ until }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Appears for 6 seconds every 150s across the full session.
  let activeInterval: number | undefined;
  for (let t = FIRST_AT; t <= until - SHOW_FOR; t += EVERY) {
    if (currentTime >= t && currentTime < t + SHOW_FOR) { activeInterval = t; break; }
  }

  if (activeInterval === undefined) {
    return null;
  }

  const relTime = currentTime - activeInterval;
  const opacity = likeBannerOpacity(currentTime, until);
  const translateX = interpolate(relTime, [0, 0.5, 5.5, 6], [40, 0, 0, 40], { extrapolateRight: 'clamp' });

  return (
    // Docked to the free space in the top-right header band. It used to sit at
    // bottom:125px, directly on top of the "NEXT:" card.
    <div style={{
      position: 'absolute',
      top: '26px',
      right: '48px',
      transform: `translateX(${translateX}px)`,
      opacity,
      zIndex: 500,
      pointerEvents: 'none'
    }}>
      {/* Solid gold fill, not the cream card style used everywhere else — this is the one
          element that is supposed to interrupt the calm palette and get noticed. */}
      <div style={{
        background: 'linear-gradient(135deg, #dcbc7c 0%, #cfa864 55%, #b88f4c 100%)',
        border: '2.5px solid #fffef7',
        borderRadius: '22px',
        padding: '12px 28px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '18px',
        whiteSpace: 'nowrap',
        boxShadow: '0 14px 34px rgba(122, 106, 88, 0.40), 0 0 0 4px rgba(207,168,100,0.18)',
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY,
          fontSize: '20px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.06em',
          textShadow: '0 1px 2px rgba(90,70,40,0.35)'
        }}>
          👍 LIKE &nbsp;•&nbsp; 💬 COMMENT &nbsp;•&nbsp; 🔔 SUBSCRIBE
        </div>
        <div style={{
          width: '1px',
          height: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.55)'
        }} />
        <div style={{
          fontFamily: FONT_BODY,
          fontSize: '14px',
          fontWeight: 700,
          color: 'rgba(255, 253, 245, 0.95)',
          letterSpacing: '0.04em'
        }}>
          Subscribe for daily mindfulness routines! 🙏
        </div>
      </div>
    </div>
  );
};

export default PeriodicLikeBanner;
