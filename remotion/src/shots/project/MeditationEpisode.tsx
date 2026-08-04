import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Video, Audio, staticFile, interpolate, Img } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import PromoEndCard from '../brand/PromoEndCard';
import SparkleParticlesOverlay from '../brand/SparkleParticlesOverlay';

export const compositionConfig = { 
  id: 'MeditationEpisode', 
  durationInSeconds: 500, // 8 min 20 sec
  fps: 30, 
  width: 1920, 
  height: 1080 
};

// Left-side B-Roll Overlay Card Component
const ConceptBrollCard: React.FC<{ 
  title: string; 
  subtitle: string; 
  bullets: string[]; 
  imagePath?: string; 
  startSec: number; 
  endSec: number; 
}> = ({ title, subtitle, bullets, imagePath, startSec, endSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  if (currentTime < startSec || currentTime > endSec) return null;

  const totalFrames = (endSec - startSec) * fps;
  const relFrame = (currentTime - startSec) * fps;

  // Smooth Spring Entrance (first 14 frames) & Elegant Exit (last 12 frames)
  const entryOpacity = interpolate(relFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(relFrame, [totalFrames - 12, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(entryOpacity, exitOpacity);

  const entryY = interpolate(relFrame, [0, 14], [36, 0], { extrapolateRight: 'clamp' });
  const exitY = interpolate(relFrame, [totalFrames - 12, totalFrames], [0, -24], { extrapolateLeft: 'clamp' });
  const translateY = relFrame > totalFrames - 12 ? exitY : entryY;

  const entryScale = interpolate(relFrame, [0, 14], [0.93, 1], { extrapolateRight: 'clamp' });
  const exitScale = interpolate(relFrame, [totalFrames - 12, totalFrames], [1, 0.96], { extrapolateLeft: 'clamp' });
  const scale = relFrame > totalFrames - 12 ? exitScale : entryScale;

  return (
    <>
      {/* Gentle Shimmer Sound Effect on Card Entrance */}
      {relFrame <= 1 && (
        <Audio src={staticFile('library/sfx/clips/warm-shimmer.mp3')} volume={0.14} />
      )}

      <div style={{
        position: 'absolute',
        top: '140px',
        left: '50px',
        width: '1060px',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: 'flex',
        flexDirection: 'row',
        gap: '36px',
        backgroundColor: 'rgba(255, 253, 248, 0.55)',
        padding: '44px',
        borderRadius: '28px',
        border: '2px solid rgba(255, 255, 255, 0.85)',
        outline: `1px solid ${COLORS.accent}40`,
        boxShadow: '0 24px 60px rgba(122, 106, 88, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(207, 168, 100, 0.2)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        zIndex: 50
      }}>
        {/* Text Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: '18px', letterSpacing: '0.15em', color: COLORS.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
            {subtitle}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: '44px', fontWeight: 700, color: COLORS.ink, lineHeight: 1.15, marginBottom: '24px' }}>
            {title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {bullets.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS.accent }} />
                <span style={{ fontFamily: FONT_BODY, fontSize: '23px', color: COLORS.ink, fontWeight: 500 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Concept Image */}
        {imagePath && (
          <div style={{ width: '380px', height: '380px', borderRadius: '20px', overflow: 'hidden', border: `2px solid ${COLORS.accent}30`, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <Img src={staticFile(imagePath)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>
    </>
  );
};

export const MeditationEpisode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Check if any B-Roll concept card or title card is active so we hide background figure to prevent overlap
  const isCardActive = 
    (currentTime >= 0 && currentTime <= 35) ||
    (currentTime >= 105 && currentTime <= 130) ||
    (currentTime >= 221 && currentTime <= 246) ||
    (currentTime >= 276 && currentTime <= 317) ||
    (currentTime >= 342 && currentTime <= 377) ||
    (currentTime >= 470 && currentTime <= 484);

  // 6-Second Breathing Cycle for Background Aura
  const breathCycle = Math.sin((currentTime * Math.PI * 2) / 6);
  const auraScale = interpolate(breathCycle, [-1, 1], [0.94, 1.08]);
  const auraOpacity = interpolate(breathCycle, [-1, 1], [0.20, 0.40]);

  // Smooth Audio Fade-Out over final 6 seconds (494s to 500s)
  const musicVolume = interpolate(currentTime, [494, 500], [0.10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      {/* Background User Humming Meditation Music Track with Smooth Ending Fade-out */}
      <Audio src={staticFile('library/music/clips/humming.mp3')} volume={musicVolume} loop />
      {/* Floating Ethereal Starlight Sparkle Dust & Mist Particles */}
      <SparkleParticlesOverlay count={35} />
      {/* Breathing Golden Aura Glow behind Meditation Watermark */}
      {!isCardActive && (
        <div style={{
          position: 'absolute',
          top: '140px',
          left: '80px',
          width: '720px',
          height: '720px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}50 0%, rgba(228, 213, 195, 0) 70%)`,
          transform: `scale(${auraScale})`,
          opacity: auraOpacity,
          zIndex: 5
        }} />
      )}
      {/* 1. Permanent Subtle Meditating Figure (Hides when a card is active to prevent overlap) */}
      <div style={{
        position: 'absolute',
        top: '180px',
        left: '120px',
        width: '640px',
        height: '640px',
        opacity: isCardActive ? 0 : 0.35,
        transition: 'opacity 0.4s ease',
        mixBlendMode: 'multiply',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 78%)',
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 78%)',
        filter: 'contrast(0.9) brightness(1.02)',
        zIndex: 10
      }}>
        <Img
          src={staticFile('projects/videos/video-1/broll/meditation_bg_figure.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            translate: "-35.8px -17.4px"
          }}
          from={1317} />
      </div>
      {/* 2. Base Video Layer (Speaker in bottom right corner + Taupe Background) */}
      <Video 
        src={staticFile('projects/videos/video-1/ep4.1 meditation-esv2-50p-bg-10p-music-10p.mp4')} 
        style={{ width: '100%', height: '100%', mixBlendMode: 'multiply' }} 
        volume={1.6}
      />
      {/* 2. Left-Side Visual B-Roll Overlay Beats */}
      {/* Starting Frame: Frosted Glass Episode Title Card (0s - 12s) */}
      {currentTime >= 0 && currentTime <= 12 && (() => {
        const titleFrame = frame;
        const entryOpacity = interpolate(titleFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
        const exitOpacity = interpolate(titleFrame, [346, 360], [1, 0], { extrapolateLeft: 'clamp' });
        const titleOpacity = Math.min(entryOpacity, exitOpacity);
        const titleY = interpolate(titleFrame, [0, 14], [30, 0], { extrapolateRight: 'clamp' });
        const titleScale = interpolate(titleFrame, [0, 14], [0.94, 1], { extrapolateRight: 'clamp' });

        return (
          <div style={{
            position: 'absolute',
            top: '200px',
            left: '50px',
            width: '1060px',
            opacity: titleOpacity,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            backgroundColor: 'rgba(255, 253, 248, 0.55)',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            outline: `1px solid ${COLORS.accent}40`,
            borderRadius: '28px',
            padding: '44px 50px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 24px 60px rgba(122, 106, 88, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(207, 168, 100, 0.2)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            zIndex: 70
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '18px', letterSpacing: '0.2em', color: COLORS.accent, fontWeight: 700, textTransform: 'uppercase' }}>
              MINDGYM MEDITATION SERIES • EPISODE 4.1
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '44px', fontWeight: 700, color: COLORS.ink, lineHeight: 1.15 }}>
              A MEDITATION FOR WHEN SOMETHING FIRES BIGGER THAN IT SHOULD
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '22px', color: COLORS.ink, opacity: 0.85, marginTop: '6px' }}>
              A Guided Mindfulness Practice for Emotional Regulation & Inner Peace
            </div>
          </div>
        );
      })()}

      {/* Beat 0: Intro Practice Setup Card (12s - 35s) */}
      <ConceptBrollCard 
        subtitle="MEDITATION PRACTICE" 
        title="When Something Fires Bigger Than It Should" 
        bullets={["Find a comfortable place", "Rest hands easily on your lap", "Notice your breath"]}
        imagePath="projects/videos/video-1/broll/scene_000.png"
        startSec={12}
        endSec={35}
      />
      {/* Beat 1: Small Moment Trigger (105s - 130s) */}
      <ConceptBrollCard 
        subtitle="STEP 1: THE TRIGGER" 
        title="Recalling A Small Moment" 
        bullets={["A message that stung", "Flash of irritation", "Small past reaction"]}
        imagePath="projects/videos/video-1/broll/scene_004.png"
        startSec={105}
        endSec={130}
      />
      {/* Beat 2: Layer 1 - The Body (221s - 246s) */}
      <ConceptBrollCard 
        subtitle="LAYER 1: PHYSICAL SENSATION" 
        title="The Body's Signal" 
        bullets={["Heat in the chest", "Tightness in jaw & shoulders", "Notice without changing it"]}
        imagePath="projects/videos/video-1/broll/scene_008.png"
        startSec={221}
        endSec={246}
      />
      {/* Beat 3: Layer 2 - The Story (276s - 317s) */}
      <ConceptBrollCard 
        subtitle="LAYER 2: THE MIND ENGINE" 
        title="Watching The Story" 
        bullets={["Mind starts spinning", "Internal dialogue & arguments", "See it simply as a story"]}
        imagePath="projects/videos/video-1/broll/scene_010.png"
        startSec={276}
        endSec={317}
      />
      {/* Beat 4: Layer 3 - The Belief (342s - 377s) */}
      <ConceptBrollCard 
        subtitle="LAYER 3: CORE BELIEF" 
        title="Naming The Deep Ache" 
        bullets={["Underneath the story", "'I am not respected'", "Name it kindly"]}
        imagePath="projects/videos/video-1/broll/scene_012.png"
        startSec={342}
        endSec={377}
      />
      {/* Beat 5: Final Recap (470s - 484s) */}
      <ConceptBrollCard 
        subtitle="PRACTICE RECAP" 
        title="The 3 Layers of Emotion" 
        bullets={["1. Body (Sensation)", "2. Story (Mind)", "3. Belief (Core Ache)"]}
        imagePath="projects/videos/video-1/broll/scene_017.png"
        startSec={470}
        endSec={484}
      />
      {/* Like, Comment & Subscribe Lower-Third Callout (1st min: 60-80s | 4th min: 240-260s | 7th min: 420-445s) */}
      {(() => {
        const isTrigger = 
          (currentTime >= 60 && currentTime <= 80) ? { start: 60, end: 80 } :
          (currentTime >= 240 && currentTime <= 260) ? { start: 240, end: 260 } :
          (currentTime >= 420 && currentTime <= 445) ? { start: 420, end: 445 } : null;

        if (!isTrigger) return null;

        const subRelFrame = (currentTime - isTrigger.start) * fps;
        const totalSubFrames = (isTrigger.end - isTrigger.start) * fps;
        const entryOp = interpolate(subRelFrame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
        const exitOp = interpolate(subRelFrame, [totalSubFrames - 12, totalSubFrames], [1, 0], { extrapolateLeft: 'clamp' });
        const subOpacity = Math.min(entryOp, exitOp);

        const entryY = interpolate(subRelFrame, [0, 14], [30, 0], { extrapolateRight: 'clamp' });
        const exitY = interpolate(subRelFrame, [totalSubFrames - 12, totalSubFrames], [0, 20], { extrapolateLeft: 'clamp' });
        const subY = subRelFrame > totalSubFrames - 12 ? exitY : entryY;

        return (
          <div style={{
            position: 'absolute',
            bottom: '160px',
            left: '60px',
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            backgroundColor: 'rgba(255, 253, 248, 0.65)',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            outline: `1px solid ${COLORS.accent}40`,
            borderRadius: '20px',
            padding: '20px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 16px 40px rgba(122, 106, 88, 0.14)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            zIndex: 60
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: 700, color: COLORS.ink }}>
              👍 Like &nbsp;•&nbsp; 💬 Comment &nbsp;•&nbsp; 🔔 Subscribe
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '16px', color: COLORS.accent, fontWeight: 600 }}>
              Subscribe for weekly guided meditation practices & emotional health series
            </div>
          </div>
        );
      })()}
      {/* 3. Final 3-Slide Promo End Sequence (482s - 500s: Course, MindGym, Subscribe Finale) */}
      {currentTime >= 482 && (
        <AbsoluteFill style={{ zIndex: 1000 }}>
          <PromoEndCard startSec={482} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export default MeditationEpisode;
