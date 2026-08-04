import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

interface PhaseRow {
  label: string;
  icon: string;
  durationSec: number;
  color: string;
  isActive: boolean;
  phaseSecondsLeft: number;
}

interface BreathingPhasePanelProps {
  startSec: number;
  type: 'bhastrika' | 'kapalbhati' | 'anulom_vilom' | 'bahya' | 'bhramari';
  totalCycles: number;
}

function getPatternForType(type: BreathingPhasePanelProps['type']): { inhale: number; hold1: number; exhale: number; hold2: number } {
  if (type === 'bhastrika') return { inhale: 2, hold1: 0, exhale: 2, hold2: 0 };
  if (type === 'kapalbhati') return { inhale: 0, hold1: 0, exhale: 1, hold2: 0 };
  if (type === 'anulom_vilom') return { inhale: 4, hold1: 16, exhale: 8, hold2: 4 };
  if (type === 'bahya') return { inhale: 3, hold1: 0, exhale: 3, hold2: 4 };
  if (type === 'bhramari') return { inhale: 4, hold1: 0, exhale: 6, hold2: 0 };
  return { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
}

function getAnulomPhase(relTime: number): { phase: string; secsLeft: number } {
  const cycle = 64;
  const t = relTime % cycle;
  if (t < 4) return { phase: 'inhale', secsLeft: Math.ceil(4 - t) };
  if (t < 20) return { phase: 'hold1', secsLeft: Math.ceil(20 - t) };
  if (t < 28) return { phase: 'exhale', secsLeft: Math.ceil(28 - t) };
  if (t < 32) return { phase: 'hold2', secsLeft: Math.ceil(32 - t) };
  if (t < 36) return { phase: 'inhale', secsLeft: Math.ceil(36 - t) };
  if (t < 52) return { phase: 'hold1', secsLeft: Math.ceil(52 - t) };
  if (t < 60) return { phase: 'exhale', secsLeft: Math.ceil(60 - t) };
  return { phase: 'hold2', secsLeft: Math.ceil(64 - t) };
}

export const BreathingPhasePanel: React.FC<BreathingPhasePanelProps> = ({ startSec, type, totalCycles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const relTime = Math.max(0, currentTime - startSec);

  const pattern = getPatternForType(type);
  const cycleDuration = Math.max(1, pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2);

  let currentPhase = 'exhale';
  let phaseSecsLeft = 0;

  if (type === 'anulom_vilom') {
    const av = getAnulomPhase(relTime);
    currentPhase = av.phase;
    phaseSecsLeft = av.secsLeft;
  } else if (type === 'kapalbhati') {
    currentPhase = 'exhale';
    phaseSecsLeft = Math.ceil(1 - (relTime % 1));
  } else {
    const cycleTime = relTime % cycleDuration;
    if (cycleTime < pattern.inhale) {
      currentPhase = 'inhale';
      phaseSecsLeft = Math.ceil(pattern.inhale - cycleTime);
    } else if (pattern.hold1 > 0 && cycleTime < pattern.inhale + pattern.hold1) {
      currentPhase = 'hold1';
      phaseSecsLeft = Math.ceil((pattern.inhale + pattern.hold1) - cycleTime);
    } else if (cycleTime < pattern.inhale + pattern.hold1 + pattern.exhale) {
      currentPhase = 'exhale';
      phaseSecsLeft = Math.ceil((pattern.inhale + pattern.hold1 + pattern.exhale) - cycleTime);
    } else {
      currentPhase = 'hold2';
      phaseSecsLeft = Math.ceil(cycleDuration - cycleTime);
    }
  }

  const completedCycles = Math.floor(relTime / cycleDuration);

  // Build phase rows (only include phases with duration > 0)
  const phases: PhaseRow[] = [];

  if (pattern.inhale > 0) {
    phases.push({
      label: type === 'anulom_vilom' ? 'INHALE (L → R)' : 'INHALE',
      icon: '🫁',
      durationSec: pattern.inhale,
      color: '#5a8a6a',
      isActive: currentPhase === 'inhale',
      phaseSecondsLeft: currentPhase === 'inhale' ? phaseSecsLeft : 0
    });
  }
  if (pattern.hold1 > 0) {
    phases.push({
      label: 'HOLD (KUMBHAKA)',
      icon: '⏸️',
      durationSec: pattern.hold1,
      color: '#a08040',
      isActive: currentPhase === 'hold1',
      phaseSecondsLeft: currentPhase === 'hold1' ? phaseSecsLeft : 0
    });
  }
  if (pattern.exhale > 0) {
    phases.push({
      label: type === 'anulom_vilom' ? 'EXHALE (R → L)' : 'EXHALE',
      icon: '💨',
      durationSec: pattern.exhale,
      color: '#4a7a9a',
      isActive: currentPhase === 'exhale',
      phaseSecondsLeft: currentPhase === 'exhale' ? phaseSecsLeft : 0
    });
  }
  if (pattern.hold2 > 0) {
    phases.push({
      label: 'HOLD (BAHYA)',
      icon: '⏸️',
      durationSec: pattern.hold2,
      color: '#a08040',
      isActive: currentPhase === 'hold2',
      phaseSecondsLeft: currentPhase === 'hold2' ? phaseSecsLeft : 0
    });
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 253, 248, 0.90)',
      border: '1.5px solid rgba(207, 168, 100, 0.40)',
      borderRadius: '28px',
      padding: '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 16px 40px rgba(122, 106, 88, 0.12)',
      backdropFilter: 'blur(24px)',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: '12px',
        fontWeight: 800,
        color: COLORS.accent,
        letterSpacing: '0.22em',
        textTransform: 'uppercase'
      }}>
        BREATHING PHASE
      </div>

      {/* Phase Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            backgroundColor: p.isActive ? `${p.color}15` : 'rgba(255,255,255,0.6)',
            border: p.isActive ? `1.5px solid ${p.color}60` : '1.5px solid rgba(207,168,100,0.15)',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: p.isActive ? `0 3px 12px ${p.color}20` : 'none'
          }}>
            {/* Row header */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: `${p.color}25`, border: `1.5px solid ${p.color}60`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0
                }}>
                  {p.icon}
                </div>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: '12px',
                  fontWeight: p.isActive ? 800 : 600,
                  color: p.isActive ? p.color : '#7a6a58',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px'
                }}>
                  {p.label}
                </span>
              </div>
              <span style={{
                fontFamily: FONT_DISPLAY, fontSize: '16px', fontWeight: 700,
                color: p.isActive ? p.color : COLORS.ink, flexShrink: 0
              }}>
                {p.isActive && p.phaseSecondsLeft > 0 ? `${p.phaseSecondsLeft}s` : `${p.durationSec}s`}
              </span>
            </div>
            {/* Color bar */}
            <div style={{ width: '100%', height: '4px', backgroundColor: `${p.color}20`, borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: p.isActive ? `${Math.max(4, (1 - p.phaseSecondsLeft / p.durationSec) * 100)}%` : '100%',
                backgroundColor: p.color, borderRadius: '3px', opacity: p.isActive ? 1 : 0.3
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(207,168,100,0.20)', margin: '0 2px' }} />

      {/* Cycle + Round counters */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(207,168,100,0.12)', border: '1.5px solid rgba(207,168,100,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🔄</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '10px', fontWeight: 700, color: COLORS.accent, letterSpacing: '0.15em', textTransform: 'uppercase' }}>CYCLE</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '18px', fontWeight: 700, color: COLORS.ink }}>
              {String(completedCycles + 1).padStart(2, '0')} / {String(totalCycles).padStart(2, '0')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(207,168,100,0.12)', border: '1.5px solid rgba(207,168,100,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🪷</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '10px', fontWeight: 700, color: COLORS.accent, letterSpacing: '0.15em', textTransform: 'uppercase' }}>ROUND</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '18px', fontWeight: 700, color: COLORS.ink }}>1 OF 1</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingPhasePanel;
