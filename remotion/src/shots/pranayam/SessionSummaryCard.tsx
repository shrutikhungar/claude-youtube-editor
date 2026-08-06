import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { PranayamLevel, SPECS_BY_LEVEL, totalReps, PRACTICE_SEC_BY_LEVEL } from './breathPattern';
import { buildTimeline } from './sessionTimeline';

interface SessionSummaryCardProps {
  startSec: number;
  durationSec: number;
  level: PranayamLevel;
}

/**
 * What you actually did, counted.
 *
 * Every number is derived from the level's specs — the same source the ring counted
 * against during the practice — so the tally cannot claim something the session did
 * not ask of you. Shown after the final congratulation and before the course promo,
 * so the last thing on screen about your practice is your own work.
 */
export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  startSec,
  durationSec,
  level,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = Math.max(0, frame / fps - startSec);

  const tl = buildTimeline(level);
  const specs = SPECS_BY_LEVEL[level];

  const rows = tl.techniques.map((t) => {
    const spec = specs[t.type];
    return {
      title: t.title,
      count: totalReps(spec),
      unit: spec.repUnit.toLowerCase() + (totalReps(spec) === 1 ? '' : 's'),
      rounds: spec.rounds,
    };
  });

  // Breaths and strokes are different actions; adding them into one number would be
  // meaningless, so they are totalled separately.
  const breaths = rows.filter((r) => r.unit.startsWith('breath')).reduce((n, r) => n + r.count, 0);
  const strokes = rows.filter((r) => r.unit.startsWith('stroke')).reduce((n, r) => n + r.count, 0);
  const cycles = rows.filter((r) => r.unit.startsWith('cycle')).reduce((n, r) => n + r.count, 0);
  // Actual practice, not elapsed time: five techniques at this level's practice length.
  // Counting from the first technique to the finale would include the spoken
  // instructions and the rests, and claim more practice than was done.
  const practiceMin = Math.round(
    (PRACTICE_SEC_BY_LEVEL[level] * tl.techniques.length) / 60,
  );

  const fade = interpolate(rel, [0, 0.5, durationSec - 0.8, durationSec], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Rows arrive one after another so the eye is led down the list.
  const rowIn = (i: number) =>
    interpolate(rel, [0.35 + i * 0.16, 0.95 + i * 0.16], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  const countUp = (n: number, i: number) =>
    Math.round(
      interpolate(rel, [0.5 + i * 0.16, 1.7 + i * 0.16], [0, n], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    );

  const Total: React.FC<{ value: number; label: string; delay: number }> = ({ value, label, delay }) => (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      opacity: interpolate(rel, [delay, delay + 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: '68px', fontWeight: 700, color: COLORS.accent2, lineHeight: 1 }}>
        {Math.round(interpolate(rel, [delay, delay + 1.3], [0, value], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))}
      </div>
      <div style={{
        fontFamily: FONT_BODY, fontSize: '14px', fontWeight: 800, color: '#7a6a58',
        letterSpacing: '0.20em', textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{
      zIndex: 99998,
      opacity: fade,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 42%, rgba(255,253,248,0.99) 0%, rgba(247,236,219,0.99) 50%, rgba(236,220,196,0.99) 100%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        width: '1180px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: '14px', fontWeight: 800, color: COLORS.accent,
          letterSpacing: '0.28em', textTransform: 'uppercase',
        }}>
          YOUR SESSION IN NUMBERS
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: '56px', fontWeight: 700, color: '#2b2520', lineHeight: 1.05,
        }}>
          {practiceMin} MINUTES OF PRACTICE
        </div>

        {/* Headline totals */}
        <div style={{
          display: 'flex', flexDirection: 'row', width: '100%',
          backgroundColor: 'rgba(255,255,255,0.72)',
          border: `1.5px solid ${COLORS.accent2}`,
          borderRadius: '24px',
          padding: '20px 24px',
          margin: '4px 0 8px',
        }}>
          <Total value={breaths} label="breaths" delay={0.5} />
          <div style={{ width: '1px', backgroundColor: 'rgba(207,168,100,0.35)' }} />
          <Total value={strokes} label="strokes" delay={0.7} />
          <div style={{ width: '1px', backgroundColor: 'rgba(207,168,100,0.35)' }} />
          <Total value={cycles} label="cycles" delay={0.9} />
        </div>

        {/* Per-technique breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', width: '100%' }}>
          {rows.map((r, i) => (
            <div key={r.title} style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: 'rgba(255,255,255,0.62)',
              border: '1.5px solid rgba(207,168,100,0.30)',
              borderRadius: '16px',
              padding: '11px 24px',
              opacity: rowIn(i),
              transform: `translateY(${(1 - rowIn(i)) * 10}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', minWidth: 0 }}>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: '13px', fontWeight: 700, color: COLORS.accent,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: '21px', fontWeight: 700, color: COLORS.ink }}>
                  {r.title}
                </span>
                <span style={{ fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 600, color: '#a2937f' }}>
                  {r.rounds} round{r.rounds > 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', flexShrink: 0 }}>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: '28px', fontWeight: 700, color: COLORS.accent2,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {countUp(r.count, i)}
                </span>
                <span style={{
                  fontFamily: FONT_BODY, fontSize: '13px', fontWeight: 800, color: '#7a6a58',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>
                  {r.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: FONT_BODY, fontSize: '17px', fontWeight: 700, color: '#7a6a58',
          letterSpacing: '0.06em', marginTop: '6px',
        }}>
          Come back tomorrow — consistency is what changes the breath.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default SessionSummaryCard;
