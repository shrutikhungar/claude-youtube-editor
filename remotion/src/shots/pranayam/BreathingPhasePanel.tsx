import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import {
  SPECS_BY_LEVEL,
  PranayamLevel,
  PHASE_COLORS,
  PHASE_ICONS,
  PHASE_SANSKRIT,
  PranayamType,
  activePhases,
  resolveBreath,
  phaseLabel,
} from './breathPattern';

interface BreathingPhasePanelProps {
  startSec: number;
  type: PranayamType;
  /** Which protocol set to read. Defaults to the beginner session. */
  level?: PranayamLevel;
}

export const BreathingPhasePanel: React.FC<BreathingPhasePanelProps> = ({ startSec, type, level = 'beginner' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const relTime = Math.max(0, currentTime - startSec);

  const spec = SPECS_BY_LEVEL[level][type];
  const state = resolveBreath(spec, relTime);
  const phases = activePhases(spec);

  return (
    <div style={{
      flex: 1,
      width: '100%',
      minHeight: 0,
      backgroundColor: 'rgba(255, 253, 248, 0.90)',
      border: '1.5px solid rgba(207, 168, 100, 0.40)',
      borderRadius: '28px',
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 16px 40px rgba(122, 106, 88, 0.12)',
      backdropFilter: 'blur(24px)',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: '13px',
        fontWeight: 800,
        color: COLORS.accent,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        flexShrink: 0
      }}>
        TECHNIQUE PATTERN
      </div>

      {/* Phase Rows — centred in the available height so a single-phase technique
          (Kapalbhati) doesn't leave a big dead gap under the header. */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
        {!state.started && (
          <div style={{
            border: '1.5px dashed rgba(207,168,100,0.45)',
            borderRadius: '16px',
            padding: '18px 16px',
            textAlign: 'center',
            fontFamily: FONT_BODY,
            fontSize: '14px',
            fontWeight: 700,
            color: '#7a6a58',
            letterSpacing: '0.08em'
          }}>
            LISTEN TO THE INSTRUCTION,<br />THEN SETTLE INTO POSITION
          </div>
        )}

        {state.resting && (
          <div style={{
            backgroundColor: 'rgba(207,168,100,0.12)',
            border: '1.5px solid rgba(207,168,100,0.45)',
            borderRadius: '16px',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            {/* No digits here — the ring is showing the rest countdown. */}
            <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 800, color: COLORS.accent, letterSpacing: '0.18em' }}>
              REST BEFORE ROUND {state.round}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 600, color: '#7a6a58', letterSpacing: '0.06em' }}>
              BREATHE NORMALLY
            </div>
          </div>
        )}

        {state.inRoundHold && (
          <div style={{
            backgroundColor: `${PHASE_COLORS[state.phase]}15`,
            border: `1.5px solid ${PHASE_COLORS[state.phase]}60`,
            borderRadius: '16px',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 800, color: COLORS.accent, letterSpacing: '0.18em' }}>
              ROUND {state.round} FINISH
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '15px', fontWeight: 800, color: PHASE_COLORS[state.phase], letterSpacing: '0.08em' }}>
              {state.phase === 'inhale' ? 'FILL THE LUNGS' : PHASE_SANSKRIT[state.phase]}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: 600, color: '#7a6a58', letterSpacing: '0.06em' }}>
              {state.phase === 'inhale'
                ? 'SLOW DEEP INHALE, THEN HOLD'
                : state.phase === 'hold1' ? 'HOLD THE BREATH IN' : 'HOLD THE BREATH OUT'}
            </div>
          </div>
        )}

        {state.started && !state.resting && !state.inRoundHold && phases.map((key) => {
          const isActive = state.phase === key;
          const color = PHASE_COLORS[key];
          return (
            <div key={key} style={{
              backgroundColor: isActive ? `${color}15` : 'rgba(255,255,255,0.6)',
              border: isActive ? `1.5px solid ${color}60` : '1.5px solid rgba(207,168,100,0.15)',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flexShrink: 0,
              boxShadow: isActive ? `0 3px 12px ${color}20` : 'none'
            }}>
              {/* Row header */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: `${color}25`, border: `1.5px solid ${color}60`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0
                  }}>
                    {PHASE_ICONS[key]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{
                      fontFamily: FONT_BODY, fontSize: '14px',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? color : '#7a6a58',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0
                    }}>
                      {phaseLabel(spec, key, state.side)}
                    </span>
                    {PHASE_SANSKRIT[key] && (
                      <span style={{
                        fontFamily: FONT_BODY, fontSize: '10px', fontWeight: 700,
                        color: isActive ? color : '#a99b86', opacity: 0.85,
                        letterSpacing: '0.14em', whiteSpace: 'nowrap'
                      }}>
                        {PHASE_SANSKRIT[key]}
                      </span>
                    )}
                  </div>
                </div>
                {/* Always the phase LENGTH, never a live countdown — the ring owns the
                    countdown. This panel is a reference for the pattern being practised. */}
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: '18px', fontWeight: 700,
                  color: isActive ? color : COLORS.ink, flexShrink: 0
                }}>
                  {spec.pattern[key]}s
                </span>
              </div>
              {/* Progress bar — fills smoothly across the phase, empty on idle rows. */}
              <div style={{ width: '100%', height: '5px', backgroundColor: `${color}20`, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: isActive ? `${Math.max(2, state.phaseProgress * 100)}%` : '0%',
                  backgroundColor: color, borderRadius: '3px'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ROUND PROGRESS — the panel used to be two thirds empty on a two-phase
          technique. This fills it with the thing you actually want to know part way
          through: how many rounds are behind you and how far into this one you are.
          One bar per round; completed rounds solid, the current one filling live. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: '11px', fontWeight: 800, color: COLORS.accent,
          letterSpacing: '0.20em', textTransform: 'uppercase',
        }}>
          ROUND PROGRESS
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '6px' }}>
          {Array.from({ length: state.rounds }).map((_, i) => {
            const done = i + 1 < state.round;
            const current = i + 1 === state.round;
            // Rest and the closing retention both count as "this round finished".
            const within = state.started && !state.resting && !state.inRoundHold
              ? state.repIndex / state.repsPerRound
              : (state.started ? 1 : 0);
            const fill = done ? 1 : current ? within : 0;
            return (
              <div key={i} style={{
                flex: 1,
                height: '10px',
                borderRadius: '5px',
                backgroundColor: 'rgba(207,168,100,0.18)',
                border: current ? `1.5px solid ${COLORS.accent2}` : '1.5px solid transparent',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}>
                <div style={{
                  width: `${Math.min(100, Math.max(0, fill * 100))}%`,
                  height: '100%',
                  backgroundColor: COLORS.accent2,
                  opacity: done ? 0.85 : 1,
                }} />
              </div>
            );
          })}
        </div>

        <div style={{
          fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 700, color: '#7a6a58',
          letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          ROUND {state.round} OF {state.rounds}
          {state.started && !state.resting && !state.inRoundHold
            && ` · ${spec.repUnit} ${state.repIndex} / ${state.repsPerRound}`}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(207,168,100,0.25)', margin: '4px 0', flexShrink: 0 }} />

      {/* NEXT RELAXATION PREVIEW CARD (Moved to Right Column) */}
      <div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        border: '1.5px solid rgba(207, 168, 100, 0.35)',
        borderRadius: '18px',
        padding: '12px 16px',
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(122, 106, 88, 0.06)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: '#eddcc4', border: '1px solid rgba(207, 168, 100, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
          }}>
            🌱
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: '9px', fontWeight: 800, color: '#7a6a58', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              NEXT:
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '15px', fontWeight: 700, color: '#2b2520' }}>
              {type === 'bhramari' ? 'SESSION COMPLETE' : '10 SEC RELAXATION'}
            </div>
          </div>
        </div>
        {type !== 'bhramari' && (
          <div style={{
            backgroundColor: '#eddcc4', border: '1px solid rgba(207, 168, 100, 0.4)',
            borderRadius: '12px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0
          }}>
            <span style={{ fontSize: '14px' }}>⌛</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: '14px', fontWeight: 700, color: '#7a6a58' }}>
              00:10
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingPhasePanel;
