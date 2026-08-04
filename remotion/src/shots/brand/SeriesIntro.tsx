import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { COLORS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { CLAMP, useRise } from '../../lib/kit';

export const compositionConfig = {
  id: 'SeriesIntro',
  durationInSeconds: 5,
  fps: 60,
  width: 1920,
  height: 1080,
};

// A noise texture overlay to simulate the frosted/cracked glass look
const NoiseOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        opacity: 0.4,
        background: `url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')`,
        mixBlendMode: 'overlay',
      }}
    />
  );
};

const SeriesIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  // Subtle fade in for the whole scene
  const opacity = interpolate(frame, [0, 15], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: '#e2e7eb', opacity }}>
      {/* Texture to give that icy / frosted glass vibe from the reference */}
      <NoiseOverlay />
      
      {/* Top Right Badge */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 40,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          borderRadius: RADIUS.pill,
          display: 'flex',
          alignItems: 'center',
          padding: '8px 24px 8px 12px',
          gap: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Img 
          src={staticFile('library/logos/si-logo.png')} 
          style={{ height: 32, objectFit: 'contain' }} 
        />
        <div style={{ fontFamily: FONT_BODY, fontSize: 20, color: 'white', fontWeight: 500, letterSpacing: 0.5 }}>
          Episode 2
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>
          ✕
        </div>
      </div>

      {/* Center Title */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            ...rise(10, 20),
            fontFamily: FONT_DISPLAY,
            fontSize: 64,
            fontWeight: 600,
            color: COLORS.ink,
            textAlign: 'center',
            letterSpacing: '0.02em',
            textShadow: '0 2px 10px rgba(255,255,255,0.5)' // subtle glow to lift it off the texture
          }}
        >
          UNDERSTANDING YOUR FEELINGS AND EMOTIONS SERIES
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default SeriesIntro;
