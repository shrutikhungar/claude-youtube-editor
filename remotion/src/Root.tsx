import React from 'react';
import { Composition, AbsoluteFill } from 'remotion';
import { shots } from './registry.gen';
import { COLORS } from './brand';
import { CaptionsOverlay } from './shots/brand/CaptionsOverlay';

const GlobalWrapper: React.FC<{ children: React.ReactNode; showCaptions?: boolean }> = ({ children, showCaptions = false }) => {
  return (
    <AbsoluteFill style={{
      border: `6px solid ${COLORS.accent}`,
      boxSizing: 'border-box'
    }}>
      {children}
      {showCaptions && <CaptionsOverlay />}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {shots.map(({ Comp, config }) => {
        const isMeditation = config.id === 'MeditationEpisode';
        const WrappedComp: React.FC = () => (
          <GlobalWrapper showCaptions={isMeditation}>
            <Comp />
          </GlobalWrapper>
        );
        return (
          <Composition
            key={config.id}
            id={config.id}
            component={WrappedComp}
            durationInFrames={Math.max(1, Math.round(config.durationInSeconds * config.fps))}
            fps={config.fps}
            width={config.width}
            height={config.height}
          />
        );
      })}
    </>
  );
};

export const Root = RemotionRoot;
