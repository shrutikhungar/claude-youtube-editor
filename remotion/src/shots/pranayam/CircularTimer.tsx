import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';

interface CircularTimerProps {
  startSec?: number;
  durationInSeconds: number;
  currentRound: number;
  totalRounds: number;
  type?: 'bhastrika' | 'kapalbhati' | 'anulom_vilom' | 'bahya' | 'bhramari';
  pattern?: { inhale: number; hold1: number; exhale: number; hold2: number };
}

function getPatternForType(type: string): { inhale: number; hold1: number; exhale: number; hold2: number } {
  if (type === 'bhastrika') return { inhale: 2, hold1: 0, exhale: 2, hold2: 0 };
  if (type === 'kapalbhati') return { inhale: 0, hold1: 0, exhale: 1, hold2: 0 };
  if (type === 'anulom_vilom') return { inhale: 4, hold1: 16, exhale: 8, hold2: 4 };
  if (type === 'bahya') return { inhale: 3, hold1: 0, exhale: 3, hold2: 4 };
  if (type === 'bhramari') return { inhale: 4, hold1: 0, exhale: 6, hold2: 0 };
  return { inhale: 4, hold1: 0, exhale: 4, hold2: 0 };
}

// Convert angle + radius to SVG circle point
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Create SVG arc path for a segment of the circle
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  startSec = 0,
  durationInSeconds,
  currentRound,
  totalRounds,
  type = 'bhastrika',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const relTime = startSec > 0 ? Math.max(0, currentTime - startSec) : currentTime;

  // Overall countdown
  const secondsLeft = Math.max(0, Math.ceil(durationInSeconds - relTime));
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const pattern = getPatternForType(type);
  const cycleDuration = Math.max(1, pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2);

  // Current phase and dot position (0-360 degrees around the ring)
  let currentPhase = 'exhale';
  let dotAngle = 270; // bottom = exhale start

  const cycleTime = relTime % cycleDuration;
  const progressInCycle = cycleTime / cycleDuration;

  if (type === 'anulom_vilom') {
    const avCycle = 64;
    const avTime = relTime % avCycle;
    if (avTime < 4) { currentPhase = 'inhale'; dotAngle = (avTime / 4) * 180; }
    else if (avTime < 20) { currentPhase = 'hold1'; dotAngle = 180 + ((avTime - 4) / 16) * 90; }
    else if (avTime < 28) { currentPhase = 'exhale'; dotAngle = 270 + ((avTime - 20) / 8) * 90; }
    else if (avTime < 32) { currentPhase = 'hold2'; dotAngle = (360 + ((avTime - 28) / 4) * 0) % 360; }
    else if (avTime < 36) { currentPhase = 'inhale'; dotAngle = (avTime - 32) / 4 * 180; }
    else if (avTime < 52) { currentPhase = 'hold1'; dotAngle = 180 + ((avTime - 36) / 16) * 90; }
    else if (avTime < 60) { currentPhase = 'exhale'; dotAngle = 270 + ((avTime - 52) / 8) * 90; }
    else { currentPhase = 'hold2'; dotAngle = 0; }
  } else if (type === 'kapalbhati') {
    currentPhase = 'exhale';
    dotAngle = 270;
  } else {
    // General cycle: inhale=top→right (0→90), hold1=right→bottom(90→180), exhale=bottom→left(180→270), hold2=left→top(270→360)
    if (cycleTime < pattern.inhale) {
      currentPhase = 'inhale';
      dotAngle = (cycleTime / pattern.inhale) * 180;
    } else if (pattern.hold1 > 0 && cycleTime < pattern.inhale + pattern.hold1) {
      currentPhase = 'hold1';
      dotAngle = 180 + ((cycleTime - pattern.inhale) / pattern.hold1) * 90;
    } else if (cycleTime < pattern.inhale + pattern.hold1 + pattern.exhale) {
      currentPhase = 'exhale';
      const t = cycleTime - pattern.inhale - pattern.hold1;
      dotAngle = 270 + (t / pattern.exhale) * 90;
    } else {
      currentPhase = 'hold2';
      const t = cycleTime - pattern.inhale - pattern.hold1 - pattern.exhale;
      dotAngle = (t / Math.max(1, pattern.hold2)) * 90 + 360 - 90;
    }
  }

  const dotAngleNorm = ((dotAngle % 360) + 360) % 360;

  // Phase display text and colors for labels
  let inhaleLabel = 'INHALE';
  let exhaleLabel = 'EXHALE';
  if (type === 'anulom_vilom') {
    inhaleLabel = 'INHALE';
    exhaleLabel = 'EXHALE';
  }

  const phaseColors: Record<string, string> = {
    inhale: '#5a8a6a',
    hold1: '#a08040',
    exhale: '#4a7a9a',
    hold2: '#a08040'
  };

  const phaseLabels: Record<string, string> = {
    inhale: inhaleLabel,
    hold1: 'HOLD',
    exhale: exhaleLabel,
    hold2: 'HOLD'
  };

  const activeColor = phaseColors[currentPhase] ?? COLORS.accent;
  const activeLabel = phaseLabels[currentPhase] ?? 'BREATHE';

  // SVG circle params
  const cx = 200, cy = 200, r = 155;
  const dotPos = polarToXY(cx, cy, r, dotAngleNorm);

  // Overall progress arc
  const progress = Math.min(1, relTime / durationInSeconds);
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - progress);

  // Segment arcs (color-coded portions of the ring based on pattern)
  const segments: Array<{ startDeg: number; endDeg: number; color: string }> = [];
  if (!['kapalbhati'].includes(type)) {
    const totalDur = cycleDuration;
    let runDeg = 0;
    const addSeg = (dur: number, color: string) => {
      if (dur > 0) {
        const span = (dur / totalDur) * 360;
        segments.push({ startDeg: runDeg, endDeg: runDeg + span, color });
        runDeg += span;
      }
    };
    addSeg(pattern.inhale, '#5a8a6a');
    addSeg(pattern.hold1, '#a08040');
    addSeg(pattern.exhale, '#4a7a9a');
    addSeg(pattern.hold2, '#a08040');
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0px',
      position: 'relative'
    }}>
      {/* === SVG Circle Ring with phase labels === */}
      <div style={{ position: 'relative', width: '400px', height: '400px' }}>
        <svg width="400" height="400" viewBox="0 0 400 400" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8dece" strokeWidth="14" />

          {/* Colored phase-segment arcs */}
          {segments.map((seg, i) => (
            <path
              key={i}
              d={arcPath(cx, cy, r, seg.startDeg, seg.endDeg)}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeLinecap="round"
              opacity={0.35}
            />
          ))}

          {/* Active overall-progress overlay arc */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={activeColor}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 200 200)"
            opacity={0.22}
          />

          {/* Animated dot on the ring */}
          <circle cx={dotPos.x} cy={dotPos.y} r={14} fill={activeColor} opacity={0.92} />
          <circle cx={dotPos.x} cy={dotPos.y} r={7} fill="#fff" />
          <circle cx={dotPos.x} cy={dotPos.y} r={26} fill={activeColor} opacity={0.18} />

          {/* Central Lotus Meditating Figure (SVG) */}
          {/* Head */}
          <ellipse cx={cx} cy={cy - 55} rx="18" ry="22" stroke="#8c7864" strokeWidth="2.5" fill="none" />
          {/* Body */}
          <path d="M185 165 Q200 170 215 165 L228 210 C232 228 222 248 200 256 C178 248 168 228 172 210 Z" stroke="#8c7864" strokeWidth="2.5" fill="none" />
          {/* Arms */}
          <path d="M172 210 L155 240 L168 258 L200 262 L232 258 L245 240 L228 210" stroke="#8c7864" strokeWidth="2.5" fill="none" />
          {/* Legs */}
          <path d="M148 248 C168 272 232 272 252 248 C264 268 240 284 200 284 C160 284 136 268 148 248 Z" stroke="#8c7864" strokeWidth="2.5" fill="none" />
          {/* Prana glow */}
          <circle cx={cx} cy={cy + 15} r="20" fill={activeColor} opacity={0.3} />
          <circle cx={cx} cy={cy + 15} r="10" fill={activeColor} opacity={0.65} />

          {/* Phase label — TOP (INHALE) */}
          <text x={cx} y={cy - r - 24} textAnchor="middle" fontFamily="sans-serif" fontSize="17" fontWeight="800"
            fill={currentPhase === 'inhale' ? phaseColors.inhale : '#aaa'} letterSpacing="2">
            {inhaleLabel}
          </text>

          {/* Phase label — BOTTOM (EXHALE) */}
          <text x={cx} y={cy + r + 38} textAnchor="middle" fontFamily="sans-serif" fontSize="17" fontWeight="800"
            fill={currentPhase === 'exhale' ? phaseColors.exhale : '#aaa'} letterSpacing="2">
            {exhaleLabel}
          </text>

          {/* Phase label — LEFT (HOLD) */}
          {pattern.hold1 > 0 && (
            <text x={cx - r - 22} y={cy + 6} textAnchor="middle" fontFamily="sans-serif" fontSize="15" fontWeight="700"
              fill={currentPhase === 'hold1' ? phaseColors.hold1 : '#bbb'} letterSpacing="1">
              HOLD
            </text>
          )}

          {/* Phase label — RIGHT (HOLD) */}
          {pattern.hold2 > 0 && (
            <text x={cx + r + 22} y={cy + 6} textAnchor="middle" fontFamily="sans-serif" fontSize="15" fontWeight="700"
              fill={currentPhase === 'hold2' ? phaseColors.hold2 : '#bbb'} letterSpacing="1">
              HOLD
            </text>
          )}
        </svg>
      </div>

      {/* === Big Overall Countdown Clock === */}
      <div style={{
        fontFamily: FONT_DISPLAY,
        fontSize: '88px',
        fontWeight: 700,
        color: COLORS.ink,
        letterSpacing: '0.04em',
        lineHeight: 1,
        marginTop: '-8px'
      }}>
        {timeFormatted}
      </div>
      <div style={{
        fontFamily: FONT_BODY,
        fontSize: '14px',
        fontWeight: 800,
        color: activeColor,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        marginTop: '8px'
      }}>
        REMAINING TIME
      </div>
    </div>
  );
};

export default CircularTimer;
