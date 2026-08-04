import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, Audio, Sequence, staticFile } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import CircularTimer from './CircularTimer';
import BreathingPhasePanel from './BreathingPhasePanel';
import PranayamCard from './PranayamCard';
import RestCard from './RestCard';
import NextRestPreview from './NextRestPreview';
import SessionOverviewCard from './SessionOverviewCard';
import SparkleParticlesOverlay from '../brand/SparkleParticlesOverlay';
import PromoEndCard from '../brand/PromoEndCard';
import PeriodicLikeBanner from '../brand/PeriodicLikeBanner';

export const compositionConfig = {
  id: 'Daily5Pranayam',
  width: 1920,
  height: 1080,
  fps: 30,
  durationInSeconds: 1680, // 28 minutes master workout video
};

export const Daily5Pranayam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Master Timeline schedule (in seconds)
  // 5 MINUTES (300s) PER TECHNIQUE + 30s REST BREAKS + INTRO/PROMO
  const isIntro      = currentTime >= 0    && currentTime < 15;
  const isBhastrika  = currentTime >= 15   && currentTime < 315;
  const isRest1      = currentTime >= 315  && currentTime < 345;
  const isKapalbhati = currentTime >= 345  && currentTime < 645;
  const isRest2      = currentTime >= 645  && currentTime < 675;
  const isAnulomVilom = currentTime >= 675 && currentTime < 975;
  const isRest3      = currentTime >= 975  && currentTime < 1005;
  const isBahya      = currentTime >= 1005 && currentTime < 1305;
  const isRest4      = currentTime >= 1305 && currentTime < 1335;
  const isBhramari   = currentTime >= 1335 && currentTime < 1635;
  const isEndPromo   = currentTime >= 1635;

  let currentType: 'bhastrika' | 'kapalbhati' | 'anulom_vilom' | 'bahya' | 'bhramari' = 'bhastrika';
  if (isKapalbhati) currentType = 'kapalbhati';
  else if (isAnulomVilom) currentType = 'anulom_vilom';
  else if (isBahya) currentType = 'bahya';
  else if (isBhramari) currentType = 'bhramari';

  const isResting = isRest1 || isRest2 || isRest3 || isRest4;
  const isActiveTechnique = isBhastrika || isKapalbhati || isAnulomVilom || isBahya || isBhramari;

  const currentStartSec = isBhastrika ? 15 : (isKapalbhati ? 345 : (isAnulomVilom ? 675 : (isBahya ? 1005 : 1335)));

  // Cycles per 5-min technique (approximate)
  const cycleCounts: Record<string, number> = {
    bhastrika: 75,    // 2+2=4s cycle → ~75 cycles in 300s
    kapalbhati: 300,  // 1 stroke/s
    anulom_vilom: 4,  // 64s cycle → ~4 cycles
    bahya: 30,        // 10s cycle → ~30 cycles
    bhramari: 30      // 10s cycle → ~30 cycles
  };
  const totalCycles = cycleCounts[currentType] ?? 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#f5ebe0', overflow: 'hidden' }}>
      {/* End Promotional Slides */}
      {isEndPromo && <PromoEndCard startSec={1635} />}

      {/* Periodic Like & Subscribe Overlay */}
      {!isEndPromo && !isIntro && <PeriodicLikeBanner />}

      {/* Soft Background Meditation Music */}
      <Audio src={staticFile('library/music/clips/humming.mp3')} volume={0.30} loop />

      {/* --- INTRO VOICE (0s - 15s) --- */}
      {isIntro && (
        <Sequence from={0} durationInFrames={15 * fps}>
          <Audio src={staticFile('library/audio/pranayam/intro_voice.mp3')} volume={0.85} />
        </Sequence>
      )}

      {/* --- BHASTRIKA AUDIO (15s - 315s) --- */}
      {isBhastrika && (
        <>
          <Sequence from={15 * fps} durationInFrames={18 * fps}>
            <Audio src={staticFile('library/audio/pranayam/bhastrika_voice.mp3')} volume={0.85} />
          </Sequence>
          <Sequence from={35 * fps} durationInFrames={2 * fps}><Audio src={staticFile('library/audio/pranayam/cue_inhale.mp3')} volume={0.85} /></Sequence>
          <Sequence from={37 * fps} durationInFrames={2 * fps}><Audio src={staticFile('library/audio/pranayam/cue_exhale.mp3')} volume={0.85} /></Sequence>
          <Sequence from={39 * fps} durationInFrames={2 * fps}><Audio src={staticFile('library/audio/pranayam/cue_inhale.mp3')} volume={0.85} /></Sequence>
          <Sequence from={120 * fps} durationInFrames={2 * fps}><Audio src={staticFile('library/audio/pranayam/cue_inhale.mp3')} volume={0.85} /></Sequence>
          <Sequence from={122 * fps} durationInFrames={2 * fps}><Audio src={staticFile('library/audio/pranayam/cue_exhale.mp3')} volume={0.85} /></Sequence>
          <Sequence from={210 * fps} durationInFrames={2 * fps}><Audio src={staticFile('library/audio/pranayam/cue_inhale.mp3')} volume={0.85} /></Sequence>
          <Sequence from={212 * fps} durationInFrames={2 * fps}><Audio src={staticFile('library/audio/pranayam/cue_exhale.mp3')} volume={0.85} /></Sequence>
        </>
      )}

      {/* --- KAPALBHATI AUDIO (345s - 645s) --- */}
      {isKapalbhati && (
        <Sequence from={345 * fps} durationInFrames={18 * fps}>
          <Audio src={staticFile('library/audio/pranayam/kapalbhati_voice.mp3')} volume={0.85} />
        </Sequence>
      )}

      {/* --- ANULOM VILOM AUDIO (675s - 975s) --- */}
      {isAnulomVilom && (
        <>
          <Sequence from={675 * fps} durationInFrames={18 * fps}>
            <Audio src={staticFile('library/audio/pranayam/anulom_vilom_voice.mp3')} volume={0.85} />
          </Sequence>
          <Sequence from={695 * fps} durationInFrames={4 * fps}><Audio src={staticFile('library/audio/pranayam/cue_inhale_left.mp3')} volume={0.85} /></Sequence>
          <Sequence from={699 * fps} durationInFrames={16 * fps}><Audio src={staticFile('library/audio/pranayam/cue_kumbhaka.mp3')} volume={0.85} /></Sequence>
          <Sequence from={715 * fps} durationInFrames={8 * fps}><Audio src={staticFile('library/audio/pranayam/cue_exhale_right.mp3')} volume={0.85} /></Sequence>
          <Sequence from={723 * fps} durationInFrames={4 * fps}><Audio src={staticFile('library/audio/pranayam/cue_hold.mp3')} volume={0.85} /></Sequence>
          <Sequence from={727 * fps} durationInFrames={4 * fps}><Audio src={staticFile('library/audio/pranayam/cue_inhale_right.mp3')} volume={0.85} /></Sequence>
          <Sequence from={731 * fps} durationInFrames={16 * fps}><Audio src={staticFile('library/audio/pranayam/cue_kumbhaka.mp3')} volume={0.85} /></Sequence>
          <Sequence from={747 * fps} durationInFrames={8 * fps}><Audio src={staticFile('library/audio/pranayam/cue_exhale_left.mp3')} volume={0.85} /></Sequence>
          <Sequence from={755 * fps} durationInFrames={4 * fps}><Audio src={staticFile('library/audio/pranayam/cue_hold.mp3')} volume={0.85} /></Sequence>
        </>
      )}

      {/* --- BAHYA AUDIO (1005s - 1305s) --- */}
      {isBahya && (
        <Sequence from={1005 * fps} durationInFrames={18 * fps}>
          <Audio src={staticFile('library/audio/pranayam/bahya_voice.mp3')} volume={0.85} />
        </Sequence>
      )}

      {/* --- BHRAMARI AUDIO (1335s - 1635s) --- */}
      {isBhramari && (
        <Sequence from={1335 * fps} durationInFrames={18 * fps}>
          <Audio src={staticFile('library/audio/pranayam/bhramari_voice.mp3')} volume={0.85} />
        </Sequence>
      )}

      {/* Sparkle Particles */}
      <SparkleParticlesOverlay count={30} />

      {/* Botanical Leaf Flourish */}
      <svg width="220" height="140" viewBox="0 0 220 140" fill="none"
        style={{ position: 'absolute', top: 0, right: 0, opacity: 0.35, pointerEvents: 'none' }}>
        <path d="M220 0 Q140 30 100 120 M140 40 Q180 20 220 10 M120 70 Q160 50 200 40 M105 100 Q140 80 180 80" stroke="#cfa864" strokeWidth="1.5" />
        <circle cx="100" cy="120" r="4" fill="#cfa864" />
      </svg>

      {/* Top Header Bar */}
      <div style={{
        position: 'absolute', top: '24px', left: '48px', right: '48px',
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 50
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '58px', height: '58px', borderRadius: '14px',
            backgroundColor: 'rgba(255,253,248,0.85)', border: '1.5px solid rgba(207,168,100,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(122,106,88,0.10)', overflow: 'hidden'
          }}>
            <Img src={staticFile('library/logos/si-logo.png')} style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: 700, color: '#2b2520', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              SOULFUL INTELLIGENCE STUDIO
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 800, color: '#7a6a58', letterSpacing: '0.18em', marginTop: '3px', textTransform: 'uppercase' }}>
              BREATHE • OBSERVE • TRANSFORM
            </div>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div style={{
        position: 'absolute', top: '100px', bottom: '18px', left: '40px', right: '40px',
        display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', zIndex: 40,
        overflow: 'hidden'
      }}>
        {/* SESSION OVERVIEW (INTRO) */}
        {isIntro && (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SessionOverviewCard />
          </div>
        )}

        {/* REST INTERVALS */}
        {isResting && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isRest1 && <RestCard startSec={315} nextTechniqueTitle="Kapalbhati Pranayam (Skull Shining)" />}
            {isRest2 && <RestCard startSec={645} nextTechniqueTitle="Anulom Vilom (Alternate Nostril)" />}
            {isRest3 && <RestCard startSec={975} nextTechniqueTitle="Bahya Pranayam (External Retention)" />}
            {isRest4 && <RestCard startSec={1305} nextTechniqueTitle="Bhramari Pranayam (Humming Bee)" />}
          </div>
        )}

        {/* ACTIVE TECHNIQUE: 3-column layout matching reference design */}
        {isActiveTechnique && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '16px' }}>

            {/* === COLUMN 1: Left Technique Info Card === */}
            <div style={{ flex: '0 0 340px', overflow: 'hidden' }}>
              {isBhastrika && (
                <PranayamCard number={1} title="BHASTRIKA PRANAYAMA" sanskritName="Bellows Breathing" durationMinutes={5}
                  instructions={["Sit comfortably with a straight spine.", "Deep inhale through the nose.", "Forceful exhale through the nose.", "Maintain a steady, rhythmic pace.", "Close your eyes if comfortable."]} />
              )}
              {isKapalbhati && (
                <PranayamCard number={2} title="KAPALBHATI PRANAYAMA" sanskritName="Skull Shining Breath" durationMinutes={5}
                  instructions={["Sit upright with spine straight and shoulders relaxed.", "Exhale forcefully contracting lower abdominal muscles.", "Allow inhalation to happen naturally and passively.", "Keep rhythm steady and comfortable.", "Focus on abdominal pulses."]} />
              )}
              {isAnulomVilom && (
                <PranayamCard number={3} title="ANULOM VILOM" sanskritName="Alternate Nostril Breathing" durationMinutes={5}
                  instructions={["Close right nostril with thumb, inhale left.", "Close left nostril, exhale through right.", "Inhale right through same nostril.", "Close right, exhale left through left nostril.", "Breathe deeply, slowly, and silently."]} />
              )}
              {isBahya && (
                <PranayamCard number={4} title="BAHYA PRANAYAMA" sanskritName="External Breath Retention" durationMinutes={5}
                  instructions={["Deep inhale followed by complete exhalation.", "Hold breath out and engage Root Lock (Mula Bandha).", "Pull stomach in for Abdominal Lock (Uddiyana).", "Touch chin to chest for Throat Lock (Jalandhara).", "Release locks smoothly before inhaling."]} />
              )}
              {isBhramari && (
                <PranayamCard number={5} title="BHRAMARI PRANAYAMA" sanskritName="Humming Bee Breath" durationMinutes={5}
                  instructions={["Close ears with thumbs, fingers gently over eyes.", "Inhale deeply through your nose.", "Exhale slowly creating a smooth humming sound.", "Feel acoustic vibrations resonance in head.", "Keep body relaxed and mind peaceful."]} />
              )}
            </div>

            {/* === COLUMN 2: Center — Circular Timer + Big Clock + Next Card === */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Circular Timer Card */}
              <div style={{
                flex: 1, width: '100%', minHeight: 0,
                backgroundColor: 'rgba(255,253,248,0.78)',
                border: '1.5px solid rgba(207,168,100,0.35)',
                borderRadius: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 16px 40px rgba(122,106,88,0.10)',
                backdropFilter: 'blur(24px)',
                overflow: 'hidden'
              }}>
                <CircularTimer
                  startSec={currentStartSec}
                  durationInSeconds={300}
                  currentRound={1}
                  totalRounds={1}
                  type={currentType}
                />
              </div>

              {/* Next Rest Preview */}
              <div style={{ width: '100%', flexShrink: 0 }}>
                <NextRestPreview
                  title={isBhramari ? "GREAT WORK! SESSION COMPLETE" : "30 SEC RELAXATION"}
                  durationSec={isBhramari ? 0 : 30}
                />
              </div>
            </div>

            {/* === COLUMN 3: Right — Breathing Phase Panel === */}
            <div style={{ flex: '0 0 370px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <BreathingPhasePanel
                startSec={currentStartSec}
                type={currentType}
                totalCycles={totalCycles}
              />
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default Daily5Pranayam;
