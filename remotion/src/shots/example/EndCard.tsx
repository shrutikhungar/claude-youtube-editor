import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { BRAND, COLORS, EASINGS, GRADIENT } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

export const compositionConfig = { id: 'EndCard', durationInSeconds: 2.4, fps: 30, width: 1920, height: 1080 };

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const barX = interpolate(frame, [12, 34], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, backgroundColor: COLORS.paper }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(2, 20), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 140, letterSpacing: '0.02em', color: COLORS.ink }}>
          {BRAND.wordmark[0]}<span style={{ color: COLORS.accent }}>{BRAND.wordmark[1]}</span>{BRAND.wordmark[2]}
        </div>
        <div style={{ width: 400, height: 6, borderRadius: 999, background: GRADIENT, marginTop: 40, transform: `scaleX(${barX})` }} />
        <div style={{ ...rise(20, 16), fontSize: 36, color: COLORS.muted, marginTop: 40 }}>{BRAND.signoff}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default EndCard;
