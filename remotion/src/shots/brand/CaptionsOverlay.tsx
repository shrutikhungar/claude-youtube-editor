import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_BODY } from '../../fonts';

let words: Array<{ text: string; start: number; end: number }> = [];
try {
  words = require('../../captions.json');
} catch (e) {
  console.log("No captions.json found");
}

export const CaptionsOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find index of word currently being spoken
  const currentWordIndex = words.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end + 0.3
  );

  // Hide captions when final promo end cards begin
  if (currentTime >= 484 || currentWordIndex === -1) {
    return null;
  }

  // Display a window of ~4 words around the active word
  const startIndex = Math.max(0, currentWordIndex - 1);
  const endIndex = Math.min(words.length, currentWordIndex + 3);
  const currentChunk = words.slice(startIndex, endIndex);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        backgroundColor: 'rgba(30, 25, 20, 0.75)',
        padding: '14px 28px',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${COLORS.accent}40`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 99999
      }}>
        {currentChunk.map((w, idx) => {
          const isCurrent = currentTime >= w.start && currentTime <= w.end;
          return (
            <span
              key={`${w.start}-${idx}`}
              style={{
                fontFamily: FONT_BODY,
                fontSize: '36px',
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? COLORS.signal : COLORS.paper,
                textShadow: isCurrent ? '0 0 12px rgba(207, 168, 100, 0.6)' : 'none',
                transition: 'color 0.1s ease',
                letterSpacing: '0.03em'
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default CaptionsOverlay;
