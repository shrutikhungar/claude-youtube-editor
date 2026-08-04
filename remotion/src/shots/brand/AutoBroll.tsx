import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, staticFile, interpolate } from 'remotion';

// Import manifest (may be empty or fail if gen_broll not run yet, so we try/catch or default)
let manifest: Array<{start: number, end: number, image: string}> = [];
try {
  manifest = require('../../broll_manifest.json');
} catch (e) {
  console.log("No broll_manifest.json found yet.");
}

export const compositionConfig = { 
  id: 'AutoBroll', 
  // We set a very long duration (1 hour) so it can cover any video length.
  // The FFmpeg compositor will trim it down to the actual video length.
  durationInSeconds: 3600, 
  fps: 30, 
  width: 1920, 
  height: 1080 
};

const BrollScene: React.FC<{ imagePath: string; startFrame: number; durationFrames: number }> = ({ imagePath, startFrame, durationFrames }) => {
  const frame = useCurrentFrame();
  
  // Calculate relative frame for this scene
  const relativeFrame = frame - startFrame;
  
  // Apply a slow, 10% zoom-in over the duration of the scene (Ken Burns effect)
  const scale = interpolate(
    relativeFrame,
    [0, durationFrames],
    [1.0, 1.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img 
        src={staticFile(imagePath)} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }} 
      />
    </AbsoluteFill>
  );
};

const AutoBroll: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find which scene we are currently in
  const currentScene = manifest.find(scene => {
    const startFrame = scene.start * fps;
    const endFrame = scene.end * fps;
    return frame >= startFrame && frame < endFrame;
  });

  if (!currentScene) {
    return <AbsoluteFill style={{ backgroundColor: '#e4d5c3' }} />;
  }

  const startFrame = currentScene.start * fps;
  const durationFrames = (currentScene.end - currentScene.start) * fps;

  return (
    <AbsoluteFill>
      <BrollScene 
        imagePath={currentScene.image} 
        startFrame={startFrame} 
        durationFrames={durationFrames} 
      />
    </AbsoluteFill>
  );
};

export default AutoBroll;
