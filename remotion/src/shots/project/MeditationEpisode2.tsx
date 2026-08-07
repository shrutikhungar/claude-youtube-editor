import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Video, Audio, staticFile, interpolate, Img } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import PromoEndCard from '../brand/PromoEndCard';
import SparkleParticlesOverlay from '../brand/SparkleParticlesOverlay';

export const compositionConfig = { 
  id: 'MeditationEpisode2', 
  durationInSeconds: 301, // 5 min 1 sec
  fps: 30, 
  width: 1920, 
  height: 1080 
};

// 7 Storyboard Visual Beats Mapped to Audio Timestamps & Visual Prompts
const MEDITATION_STORYBOARD = [
  {
    num: '01',
    id: 'intro',
    startSec: 0,
    endSec: 14.5,
    image: 'projects/video-1/broll/epi4_2_vis_feather.jpg',
    tag: 'BREATH & SAFETY',
    title: 'Settling Into Stillness',
    lines: [
      'Find a comfortable spot',
      'Let your eyes gently close',
      'Take a slow, easy breath',
      'in and out'
    ]
  },
  {
    num: '02',
    id: 'settling',
    startSec: 14.5,
    endSec: 45,
    image: 'projects/video-1/broll/epi4_2_vis_breath.jpg',
    tag: 'BREATH & SAFETY',
    title: 'Settling Into Stillness',
    lines: [
      'Find a comfortable spot',
      'Let your eyes gently close',
      'Take a slow, easy breath',
      'in and out'
    ]
  },
  {
    num: '03',
    id: 'hurt',
    startSec: 45,
    endSec: 90,
    image: 'projects/video-1/broll/epi4_2_vis_mugs.jpg',
    tag: 'UNFINISHED HURT',
    title: 'Recalling Unfinished Hurt',
    lines: [
      'Remember the warmth that used to be there',
      'Notice the sudden coldness & distance',
      'Allow the memory to be here with you'
    ]
  },
  {
    num: '04',
    id: 'ocean',
    startSec: 90,
    endSec: 140,
    image: 'projects/video-1/broll/epi4_2_vis_ocean.jpg',
    tag: 'OCEAN AT SUNRISE',
    title: 'Calm Sea & Golden Horizon',
    lines: [
      'Rest your awareness on the gentle waves',
      'Notice the golden horizon mist',
      'Allow your breath to move like the water'
    ]
  },
  {
    num: '05',
    id: 'body',
    startSec: 140,
    endSec: 200,
    image: 'projects/video-1/broll/epi4_2_vis_fabric.jpg',
    tag: 'FLOWING SILK',
    title: 'Body Physical Sensation',
    lines: [
      'Locate where tightness lives in your body',
      'Rest your awareness right there, softly',
      'Do not try to fix it—let it soften'
    ]
  },
  {
    num: '06',
    id: 'belief',
    startSec: 200,
    endSec: 250,
    image: 'projects/video-1/broll/epi4_2_vis_heart_window.jpg',
    tag: 'CORE BELIEF',
    title: 'Releasing the Core Belief',
    lines: [
      'Pause the mind\'s "why" story for a moment',
      'Notice the belief: "I don\'t deserve someone who stays"',
      'You do not have to fight it—just observe'
    ]
  },
  {
    num: '07',
    id: 'closing',
    startSec: 250,
    endSec: 283,
    image: 'projects/video-1/broll/epi4_2_vis_sunrise.jpg',
    tag: 'INTEGRATION',
    title: 'Practice Integration',
    lines: [
      'Notice the new space inside your body',
      'Slowly open your eyes when ready',
      'Every session leaves you lighter & peaceful'
    ]
  }
];

export const MeditationEpisode2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Active shot
  const activeShotIndex = MEDITATION_STORYBOARD.findIndex(s => currentTime >= s.startSec && currentTime < s.endSec);
  const activeShot = MEDITATION_STORYBOARD[Math.max(0, activeShotIndex)];

  // Smooth Audio Fade-Out over final 6 seconds (295s to 301s)
  const musicVolume = interpolate(currentTime, [295, 301], [0.08, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1410' }}>
      {/* Background Humming Meditation Music Track */}
      <Audio src={staticFile('library/music/clips/humming.mp3')} volume={musicVolume} loop />

      {/* Floating Ethereal Dust Particles Overlay */}
      <SparkleParticlesOverlay count={35} />

      {/* B-ROLL BACKGROUND LAYER (100% Solid Vibrant Visual Backdrop) */}
      {MEDITATION_STORYBOARD.map((shot) => {
        if (currentTime < shot.startSec - 1 || currentTime > shot.endSec + 1) return null;
        const totalSec = shot.endSec - shot.startSec;
        const relTime = currentTime - shot.startSec;

        // Subtle Ken Burns 2.5% zoom push-in over scene duration
        const scale = interpolate(relTime, [0, totalSec], [1.0, 1.025], { extrapolateRight: 'clamp' });
        const fadeIn = interpolate(relTime, [0, 1.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const fadeOut = interpolate(relTime, [totalSec - 1.2, totalSec], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const opacity = Math.min(fadeIn, fadeOut); // 100% full opacity during scene!

        return (
          <div key={shot.id} style={{
            position: 'absolute',
            inset: 0,
            opacity,
            transform: `scale(${scale})`,
            zIndex: 2,
            transition: 'opacity 1.2s ease-in-out'
          }}>
            <img 
              src={'/' + shot.image.replace(/^public\//, '').replace(/^\//, '')} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        );
      })}

      {/* Volumetric Soft Light Rays Overlay for Text High Contrast */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(20, 12, 6, 0.45) 0%, rgba(20, 12, 6, 0.10) 50%, rgba(20, 12, 6, 0.35) 100%)',
        zIndex: 3
      }} />

      {/* TALKING HEAD SPEAKER (Soft Radial Feather Mask — ZERO Box Edges / ZERO Patches!) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '850px',
        height: '850px',
        overflow: 'hidden',
        zIndex: 100,
        maskImage: 'radial-gradient(circle at 75% 75%, black 45%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(circle at 75% 75%, black 45%, transparent 75%)'
      }}>
        <Video 
          src={staticFile('projects/video-1/epi4_2_clean_voice.mp4')} 
          style={{ 
            position: 'absolute',
            bottom: '-10px',
            right: '10px',
            height: '82%', // 885px tall
            width: 'auto',
            mixBlendMode: 'multiply'
          }} 
          volume={1.0}
        />
      </div>

      {/* LEFT TEXT LAYOUT — HIGH CONTRAST CLEAR TEXT */}
      {currentTime < 283 && (() => {
        const shotRelTime = currentTime - activeShot.startSec;
        const textOpacity = interpolate(shotRelTime, [0, 1.2], [0, 1], { extrapolateRight: 'clamp' });
        const textY = interpolate(shotRelTime, [0, 1.2], [15, 0], { extrapolateRight: 'clamp' });

        return (
          <div style={{
            position: 'absolute',
            top: '130px',
            left: '110px',
            maxWidth: '850px',
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50
          }}>
            {/* Large Muted Gold Chapter Number (01, 02, 03...) */}
            <div style={{ 
              fontFamily: FONT_DISPLAY, 
              fontSize: '145px', 
              fontWeight: 700, 
              color: '#D4AF37', 
              lineHeight: 0.88,
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)'
            }}>
              {activeShot.num}
            </div>

            {/* Serif Title */}
            <div style={{ 
              fontFamily: FONT_DISPLAY, 
              fontSize: '54px', 
              fontWeight: 700, 
              color: '#FFFDF9', 
              lineHeight: 1.15,
              marginBottom: '20px',
              textShadow: '0 2px 14px rgba(0,0,0,0.85)'
            }}>
              {activeShot.title}
            </div>

            {/* Horizontal Gold Accent Line */}
            <div style={{ 
              width: '70px', 
              height: '3px', 
              backgroundColor: '#D4AF37', 
              marginBottom: '30px',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)'
            }} />

            {/* High Contrast White Floating Guidance Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeShot.lines.map((line, idx) => (
                <div key={idx} style={{ 
                  fontFamily: FONT_BODY, 
                  fontSize: '28px', 
                  color: '#FFFDF9', 
                  fontWeight: 600, 
                  lineHeight: 1.5,
                  textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)'
                }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Like, Comment & Subscribe Callout (60-78s & 200-218s) */}
      {(() => {
        const isTrigger = 
          (currentTime >= 60 && currentTime <= 78) ? { start: 60, end: 78 } :
          (currentTime >= 200 && currentTime <= 218) ? { start: 200, end: 218 } : null;

        if (!isTrigger) return null;

        const subRelFrame = (currentTime - isTrigger.start) * fps;
        const totalSubFrames = (isTrigger.end - isTrigger.start) * fps;
        const entryOp = interpolate(subRelFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
        const exitOp = interpolate(subRelFrame, [totalSubFrames - 12, totalSubFrames], [1, 0], { extrapolateLeft: 'clamp' });
        const subOpacity = Math.min(entryOp, exitOp);

        return (
          <div style={{
            position: 'absolute',
            bottom: '120px',
            left: '110px',
            opacity: subOpacity,
            backgroundColor: 'rgba(255, 253, 248, 0.92)',
            border: '1.5px solid rgba(194, 120, 52, 0.4)',
            borderRadius: '20px',
            padding: '20px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            zIndex: 60
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: 700, color: '#2C1D11' }}>
              👍 Like &nbsp;•&nbsp; 💬 Comment &nbsp;•&nbsp; 🔔 Subscribe
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '16px', color: '#C27834', fontWeight: 600 }}>
              Subscribe for weekly guided meditation practices & emotional health series
            </div>
          </div>
        );
      })()}

      {/* Final 3-Slide Promo End Sequence (283s - 301s) */}
      {currentTime >= 283 && (
        <AbsoluteFill style={{ zIndex: 1000 }}>
          <PromoEndCard startSec={283} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export default MeditationEpisode2;
