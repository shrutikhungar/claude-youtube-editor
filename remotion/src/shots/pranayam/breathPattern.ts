/**
 * Single source of truth for pranayam pacing.
 *
 * Every on-screen counter (the ring dot, the big countdown, the phase rows, the
 * BREATH / ROUND readouts, the between-round rest) is derived from `resolveBreath`,
 * so they cannot drift apart the way the hand-rolled per-component maths used to.
 *
 * Pacing is BEGINNER level throughout — see the notes on each spec.
 */

export type PranayamType = 'bhastrika' | 'kapalbhati' | 'anulom_vilom' | 'bahya' | 'bhramari';

export type PhaseKey = 'inhale' | 'hold1' | 'exhale' | 'hold2';

/** Phase order around the ring, clockwise from 12 o'clock. */
export const PHASE_ORDER: PhaseKey[] = ['inhale', 'hold1', 'exhale', 'hold2'];

export const PHASE_COLORS: Record<PhaseKey, string> = {
  inhale: '#5a8a6a',
  hold1: '#a08040',
  exhale: '#4a7a9a',
  hold2: '#a08040',
};

export const PHASE_ICONS: Record<PhaseKey, string> = {
  inhale: '🫁',
  hold1: '⏸️',
  exhale: '💨',
  hold2: '⏸️',
};

/** Traditional name, shown as a secondary line so the plain-English cue stays primary. */
export const PHASE_SANSKRIT: Partial<Record<PhaseKey, string>> = {
  hold1: 'ANTAR KUMBHAKA',
  hold2: 'BAHYA KUMBHAKA',
};

export interface PranayamSpec {
  /** Seconds per phase of ONE breath. 0 means the phase is not part of this technique. */
  pattern: Record<PhaseKey, number>;
  /** Inhale/exhale turns (or strokes, for Kapalbhati) in one round. */
  breathsPerRound: number;
  rounds: number;
  /** Recovery between rounds. Chosen so practice lands on exactly 300s. */
  restBetweenRoundsSec: number;
  /**
   * Retention held ONCE at the end of every round, after the last breath.
   * This is where kumbhaka belongs for the forceful techniques (Bhastrika,
   * Kapalbhati) — holding on every single bellows breath would be wrong.
   *
   * The round closes with a deliberate deep inhale FIRST — there is no air to hold
   * after an exhale, so antar kumbhaka must always be preceded by filling the lungs.
   */
  endOfRoundInhaleSec: number;
  endOfRoundAntarSec: number;
  endOfRoundBahyaSec: number;
  /** Spoken instruction + settle time before breathing starts. Must exceed the voice clip. */
  leadInSec: number;
  /** Alternate-nostril techniques swap sides every turn. */
  alternatesSides: boolean;
  /**
   * How many inhale/exhale turns make up one COUNTED repetition.
   * 1 for most techniques. Anulom Vilom is 2, because one traditional cycle is the
   * full left-in / right-out / right-in / left-out sequence, not a single breath.
   */
  turnsPerRep: number;
  /** Word used for one counted repetition. */
  repUnit: string;
  /** Override the plain INHALE / EXHALE cues where the technique is more specific. */
  inhaleLabel?: string;
  exhaleLabel?: string;
}

/**
 * BEGINNER protocols. Rounds-with-rest, not one unbroken 5-minute block —
 * continuous forceful breathing for 5 minutes is not beginner-safe.
 *
 * Every spec is tuned so `practiceSeconds` lands on EXACTLY 300s, which is what the
 * on-screen "5 MINUTES" badge and the countdown clock both refer to. The spoken
 * lead-in sits outside that 300s.
 */
export const PRANAYAM_SPECS: Record<PranayamType, PranayamSpec> = {
  // 30 breaths/min (1s in, 1s out) — the standard beginner bellows rate. The old 2s/2s
  // was half speed and did not read as bellows breathing. No per-breath hold: kumbhaka
  // comes as a 6s antar retention at the END of each round (beginner: 5-10s).
  // 5 short rounds with a brisk 10s recovery rather than fewer long ones.
  // Each round closes with a 4s deep inhale then a 6s retention.
  // 5 x (42s + 4s inhale + 6s hold) + 4 x 10s rest = 300s. 105 breaths.
  bhastrika: {
    pattern: { inhale: 1, hold1: 0, exhale: 1, hold2: 0 },
    breathsPerRound: 21,
    rounds: 5,
    restBetweenRoundsSec: 10,
    endOfRoundInhaleSec: 4,
    endOfRoundAntarSec: 6,
    endOfRoundBahyaSec: 0,
    leadInSec: 28,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'BREATH',
    // Bellows breathing is full-volume at speed — "INHALE" alone reads too gentle.
    inhaleLabel: 'DEEP INHALE',
    exhaleLabel: 'DEEP EXHALE',
  },
  // 1 stroke/sec, passive inhale. 5 x 40 = 200 strokes.
  // Each round closes with a 4s deep inhale then an 8s retention — the traditional
  // finish to a Kapalbhati set.
  // 5 x (40s + 4s inhale + 8s hold) + 4 x 10s rest = 300s.
  kapalbhati: {
    pattern: { inhale: 0, hold1: 0, exhale: 1, hold2: 0 },
    breathsPerRound: 40,
    rounds: 5,
    restBetweenRoundsSec: 10,
    endOfRoundInhaleSec: 4,
    endOfRoundAntarSec: 8,
    endOfRoundBahyaSec: 0,
    leadInSec: 28,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'STROKE',
    // The whole technique is the sharp abdominal exhale — the inhale is passive.
    exhaleLabel: 'FORCEFUL EXHALE',
  },
  // THE four-part breath: inhale -> antar kumbhaka -> exhale -> bahya kumbhaka.
  // Beginner ratio 1:1:1:0.5 — internal hold equal to the inhale, external hold half.
  // (The 1:4:2 Hatha ratio, a 16s internal hold, is advanced and stays out of this video.)
  // Turn = 14s; 2 rounds x 10 turns (5 cycles) + 20s rest = 300s. 10 cycles total.
  anulom_vilom: {
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 2 },
    breathsPerRound: 10,
    rounds: 2,
    restBetweenRoundsSec: 20,
    endOfRoundInhaleSec: 0,
    endOfRoundAntarSec: 0,
    endOfRoundBahyaSec: 0,
    leadInSec: 28,
    alternatesSides: true,
    turnsPerRep: 2,
    repUnit: 'CYCLE',
  },
  // Bahya Pranayama: 4s Inhale, 6s Exhale, 12s External Hold (Bahya Kumbhaka)
  // 3 rounds x (4 breaths x 22s) + 2 x 18s rest = 264s + 36s = 300s (5 MINUTES).
  bahya: {
    pattern: { inhale: 4, hold1: 0, exhale: 6, hold2: 12 },
    breathsPerRound: 4,
    rounds: 3,
    restBetweenRoundsSec: 18,
    endOfRoundInhaleSec: 0,
    endOfRoundAntarSec: 0,
    endOfRoundBahyaSec: 0,
    leadInSec: 28,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'BREATH',
  },
  // Bhramari Pranayama: 4s Inhale, 1s Settle Hold, 15s Humming Exhale (Hum Out).
  // 2 rounds x (7 breaths x 20s) + 1 x 20s rest = 280s + 20s = 300s (5 MINUTES).
  bhramari: {
    pattern: { inhale: 4, hold1: 1, exhale: 15, hold2: 0 },
    breathsPerRound: 7,
    rounds: 2,
    restBetweenRoundsSec: 20,
    endOfRoundInhaleSec: 0,
    endOfRoundAntarSec: 0,
    endOfRoundBahyaSec: 0,
    leadInSec: 28,
    alternatesSides: false,
    turnsPerRep: 1,
    repUnit: 'BREATH',
    exhaleLabel: 'HUM OUT',
  },
};

/** Phases actually used by a technique, in ring order. */
export function activePhases(spec: PranayamSpec): PhaseKey[] {
  return PHASE_ORDER.filter((k) => spec.pattern[k] > 0);
}

/** Seconds in one full breath. */
export function cycleSeconds(spec: PranayamSpec): number {
  return Math.max(1, PHASE_ORDER.reduce((sum, k) => sum + spec.pattern[k], 0));
}

/** Seconds of continuous breathing in one round, before the closing retention. */
export function breathingSeconds(spec: PranayamSpec): number {
  return cycleSeconds(spec) * spec.breathsPerRound;
}

/**
 * Closing sequence at the end of each round: the preparatory deep inhale plus the
 * retention(s). 0 where the technique has none.
 */
export function endOfRoundHoldSeconds(spec: PranayamSpec): number {
  return spec.endOfRoundInhaleSec + spec.endOfRoundAntarSec + spec.endOfRoundBahyaSec;
}

/** Seconds of one round: the breaths plus its closing sequence (no rest). */
export function roundSeconds(spec: PranayamSpec): number {
  return breathingSeconds(spec) + endOfRoundHoldSeconds(spec);
}

/**
 * Seconds of actual practice: all rounds plus the rests between them.
 * This — not the slot length — is what the countdown clock and the "5 MINUTES"
 * badge refer to. The spoken lead-in is deliberately excluded.
 */
export function practiceSeconds(spec: PranayamSpec): number {
  const rests = Math.max(0, spec.rounds - 1) * spec.restBetweenRoundsSec;
  return roundSeconds(spec) * spec.rounds + rests;
}

/** Full slot in the master timeline: spoken instruction + practice. */
export function totalSeconds(spec: PranayamSpec): number {
  return spec.leadInSec + practiceSeconds(spec);
}

/** Counted repetitions in one round (Anulom Vilom counts 4-step cycles, not breaths). */
export function repsPerRound(spec: PranayamSpec): number {
  return Math.round(spec.breathsPerRound / spec.turnsPerRep);
}

/** Everything the practitioner completes across the whole technique. */
export function totalReps(spec: PranayamSpec): number {
  return repsPerRound(spec) * spec.rounds;
}

export interface BreathState {
  /** false during the spoken lead-in, before breathing begins. */
  started: boolean;
  /** true while resting between rounds. */
  resting: boolean;
  restSecondsLeft: number;
  /** true during the retention that closes a round (Bhastrika / Kapalbhati). */
  inRoundHold: boolean;

  phase: PhaseKey;
  /** Whole seconds left in the phase, for the digit readout (1..phase length). */
  phaseSecondsLeft: number;
  /** 0..1 through the current phase — smooth, for progress bars. */
  phaseProgress: number;
  /** 0..1 through the whole breath — smooth, drives the ring dot. */
  cycleProgress: number;

  /** 1-based counted repetition within the current round. */
  repIndex: number;
  repsPerRound: number;
  /** 1-based. */
  round: number;
  rounds: number;

  /** Which nostril leads this breath (alternate-nostril techniques only). */
  side: 'left' | 'right';

  /**
   * Seconds left of PRACTICE — the big centre clock. Frozen at the full practice
   * length throughout the spoken lead-in, so the clock does not tick while the
   * narrator is still giving instructions.
   */
  practiceSecondsLeft: number;
  /** 0..1 through the practice, 0 during the lead-in. */
  practiceProgress: number;
}

/**
 * @param relTime seconds since the technique's slot began (0 = start of lead-in).
 */
export function resolveBreath(spec: PranayamSpec, relTime: number): BreathState {
  const cycle = cycleSeconds(spec);
  const round = roundSeconds(spec);
  const rest = spec.restBetweenRoundsSec;
  const slot = round + rest;
  const practice = practiceSeconds(spec);

  const t = relTime - spec.leadInSec;

  // The clock only starts once the instruction is over and practice begins.
  const practiceElapsed = Math.min(practice, Math.max(0, t));
  const practiceSecondsLeft = Math.max(0, Math.ceil(practice - practiceElapsed));
  const practiceProgress = practice > 0 ? practiceElapsed / practice : 0;

  const base: BreathState = {
    started: false,
    resting: false,
    restSecondsLeft: 0,
    inRoundHold: false,
    phase: activePhases(spec)[0] ?? 'exhale',
    phaseSecondsLeft: spec.pattern[activePhases(spec)[0] ?? 'exhale'],
    phaseProgress: 0,
    cycleProgress: 0,
    repIndex: 1,
    repsPerRound: repsPerRound(spec),
    round: 1,
    rounds: spec.rounds,
    side: 'left',
    practiceSecondsLeft,
    practiceProgress,
  };

  if (t < 0) return base;

  // Which round-slot are we in? Clamp so the final round never rolls past the end.
  const roundIdx = Math.min(spec.rounds - 1, Math.floor(t / slot));
  const within = t - roundIdx * slot;

  if (within >= round) {
    // Between-rounds rest.
    return {
      ...base,
      started: true,
      resting: true,
      restSecondsLeft: Math.max(0, Math.ceil(slot - within)),
      round: Math.min(spec.rounds, roundIdx + 2), // resting *before* the next round
    };
  }

  const breathing = breathingSeconds(spec);
  if (within >= breathing) {
    // Closing sequence of the round: fill the lungs first, THEN hold. You cannot hold
    // air in straight off an exhale.
    const heldFor = within - breathing;
    const inhaleSec = spec.endOfRoundInhaleSec;
    const antarEnd = inhaleSec + spec.endOfRoundAntarSec;

    let holdPhase: PhaseKey;
    let holdDur: number;
    let elapsed: number;
    if (heldFor < inhaleSec) {
      holdPhase = 'inhale';
      holdDur = inhaleSec;
      elapsed = heldFor;
    } else if (heldFor < antarEnd) {
      holdPhase = 'hold1';
      holdDur = spec.endOfRoundAntarSec;
      elapsed = heldFor - inhaleSec;
    } else {
      holdPhase = 'hold2';
      holdDur = spec.endOfRoundBahyaSec;
      elapsed = heldFor - antarEnd;
    }
    holdDur = Math.max(0.0001, holdDur);

    return {
      ...base,
      started: true,
      inRoundHold: true,
      phase: holdPhase,
      phaseSecondsLeft: Math.max(1, Math.ceil(holdDur - elapsed)),
      phaseProgress: Math.min(1, elapsed / holdDur),
      cycleProgress: Math.min(1, elapsed / holdDur),
      repIndex: repsPerRound(spec),
      round: roundIdx + 1,
    };
  }

  const breathIdx = Math.min(spec.breathsPerRound - 1, Math.floor(within / cycle));
  const cycleTime = within - breathIdx * cycle;

  // Walk the phases to find where cycleTime lands.
  let phase: PhaseKey = activePhases(spec)[0] ?? 'exhale';
  let elapsedInPhase = 0;
  let acc = 0;
  for (const k of PHASE_ORDER) {
    const dur = spec.pattern[k];
    if (dur <= 0) continue;
    if (cycleTime < acc + dur) {
      phase = k;
      elapsedInPhase = cycleTime - acc;
      break;
    }
    acc += dur;
    // Past the last phase (float slop at the cycle boundary) — stay on it.
    phase = k;
    elapsedInPhase = dur;
  }

  const phaseDur = Math.max(0.0001, spec.pattern[phase]);
  const remaining = phaseDur - elapsedInPhase;

  return {
    started: true,
    resting: false,
    restSecondsLeft: 0,
    inRoundHold: false,
    phase,
    phaseSecondsLeft: Math.max(1, Math.ceil(remaining)),
    phaseProgress: Math.min(1, Math.max(0, elapsedInPhase / phaseDur)),
    cycleProgress: Math.min(1, Math.max(0, cycleTime / cycle)),
    repIndex: Math.floor(breathIdx / spec.turnsPerRep) + 1,
    repsPerRound: repsPerRound(spec),
    round: roundIdx + 1,
    rounds: spec.rounds,
    // Anulom Vilom: turn 1 inhales LEFT (exhales right), turn 2 inhales RIGHT
    // (exhales left) — the traditional L-in / R-out / R-in / L-out sequence.
    side: breathIdx % 2 === 0 ? 'left' : 'right',
    practiceSecondsLeft,
    practiceProgress,
  };
}

/** Human label for a phase, including the nostril for alternate-nostril work. */
export function phaseLabel(spec: PranayamSpec, key: PhaseKey, side: 'left' | 'right'): string {
  if (!spec.alternatesSides) {
    if (key === 'inhale') return spec.inhaleLabel ?? 'INHALE';
    if (key === 'exhale') return spec.exhaleLabel ?? 'EXHALE';
    return key === 'hold1' ? 'HOLD IN' : 'HOLD OUT';
  }
  // Inhale on one nostril, exhale on the other.
  const inNostril = side === 'left' ? 'LEFT' : 'RIGHT';
  const outNostril = side === 'left' ? 'RIGHT' : 'LEFT';
  if (key === 'inhale') return `INHALE ${inNostril}`;
  if (key === 'exhale') return `EXHALE ${outNostril}`;
  return key === 'hold1' ? 'HOLD IN' : 'HOLD OUT';
}
