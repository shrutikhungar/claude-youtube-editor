import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { CLAMP, useRise } from '../../lib/kit';

export const compositionConfig = {
  id: 'ConceptTitle',
  durationInSeconds: 5,
  fps: 60,
  width: 1920,
  height: 1080,
};

const DecorativeLine: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, ...style }}>
      <div style={{ height: 1, width: 80, backgroundColor: COLORS.ink, opacity: 0.3 }} />
      <div style={{ color: COLORS.accent2, fontSize: 24, lineHeight: 1 }}>✦</div>
      <div style={{ height: 1, width: 80, backgroundColor: COLORS.ink, opacity: 0.3 }} />
    </div>
  );
};

const ConceptTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  return (
    <AbsoluteFill style={{ padding: '120px 160px', justifyContent: 'center' }}>
      
      {/* 
        This is a transparent overlay meant to be placed on top of a 
        3D motion clip (e.g. your Runway/Luma generated MP4).
        The layout positions the text beautifully on the left side. 
      */}

      <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <DecorativeLine style={rise(10, 20)} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div 
            style={{ 
              ...rise(15, 20),
              fontFamily: FONT_DISPLAY, 
              fontSize: 82, 
              color: COLORS.ink, 
              lineHeight: 1.1,
              letterSpacing: '0.05em'
            }}
          >
            LACK OF
          </div>
          <div 
            style={{ 
              ...rise(20, 20),
              fontFamily: FONT_DISPLAY, 
              fontSize: 82, 
              color: COLORS.accent2, // Gold color
              lineHeight: 1.1,
              letterSpacing: '0.05em'
            }}
          >
            CLOSURE
          </div>
        </div>

        <div style={{ ...rise(25, 20), width: '80%', height: 1, backgroundColor: COLORS.ink, opacity: 0.2, margin: '16px 0' }} />

        <div 
          style={{ 
            ...rise(30, 20),
            fontFamily: FONT_BODY, 
            fontSize: 28, 
            color: COLORS.ink, 
            lineHeight: 1.6,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          The gap between <br/>
          <span style={{ color: COLORS.accent2 }}>who they were</span> <br/>
          and who they <br/>
          <span style={{ color: COLORS.accent2 }}>became</span>
        </div>

      </div>
    </AbsoluteFill>
  );
};

export default ConceptTitle;
