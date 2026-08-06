/**
 * Master timeline for a Daily 5 Pranayam session.
 *
 * Kept in a plain .ts module (no JSX) so build scripts can import it directly — the
 * YouTube chapter list, the subtitle file and the breathing audio are all generated
 * from these exact numbers rather than retyped, which is the only way they stay true
 * after a retime.
 *
 * Built per LEVEL: every technique slot is derived from its spec (spoken lead-in plus
 * that level's practice seconds), so changing a protocol in breathPattern.ts reflows
 * the whole video.
 */
import {
  PranayamType,
  PranayamLevel,
  PranayamSpec,
  SPECS_BY_LEVEL,
  totalSeconds,
} from './breathPattern';

export const INTRO_SEC = 36;        // beginner intro voice runs 31.8s
export const INTRO_SEC_INTERMEDIATE = 40;
export const REST_SEC = 10;         // relaxation between techniques
export const VOICE_WINDOW_SEC = 28; // longest technique intro clip is 23.3s
export const PROMO_SEC = 18;
export const CELEBRATE_SEC = 8;     // congratulation flash after each technique
export const SUMMARY_SEC = 16;      // whole-session tally, before the course promo
export const TRANSITION_SEC = 1.1;  // digital wipe into each new technique

export interface TechniqueSlot {
  type: PranayamType;
  index: number;
  /** English name — the video never speaks the Sanskrit. */
  title: string;
  sanskrit: string;
  startSec: number;
  celebrateSec: number;
}

export interface SessionTimeline {
  level: PranayamLevel;
  specs: Record<PranayamType, PranayamSpec>;
  introSec: number;
  T_BHASTRIKA: number;
  T_CELEB_1: number;
  T_REST_1: number;
  T_KAPALBHATI: number;
  T_CELEB_2: number;
  T_REST_2: number;
  T_ANULOM: number;
  T_CELEB_3: number;
  T_REST_3: number;
  T_BAHYA: number;
  T_CELEB_4: number;
  T_REST_4: number;
  T_BHRAMARI: number;
  T_FINALE: number;
  T_SUMMARY: number;
  T_PROMO: number;
  SESSION_SEC: number;
  techniques: TechniqueSlot[];
}

const NAMES: Array<{ type: PranayamType; title: string; sanskrit: string }> = [
  { type: 'bhastrika', title: 'Bellows Breathing', sanskrit: 'Bhastrika' },
  { type: 'kapalbhati', title: 'Skull Shining Breath', sanskrit: 'Kapalbhati' },
  { type: 'anulom_vilom', title: 'Alternate Nostril Breathing', sanskrit: 'Anulom Vilom' },
  { type: 'bahya', title: 'External Breath Retention', sanskrit: 'Bahya' },
  { type: 'bhramari', title: 'Humming Bee Breath', sanskrit: 'Bhramari' },
];

/**
 * Each technique is followed by its own celebration window and then the relaxation,
 * so the congratulation flash never eats into the rest.
 */
export function buildTimeline(level: PranayamLevel): SessionTimeline {
  const specs = SPECS_BY_LEVEL[level];
  const slot = (t: PranayamType) => totalSeconds(specs[t]);
  const introSec = level === 'intermediate' ? INTRO_SEC_INTERMEDIATE : INTRO_SEC;

  const T_BHASTRIKA = introSec;
  const T_CELEB_1 = T_BHASTRIKA + slot('bhastrika');
  const T_REST_1 = T_CELEB_1 + CELEBRATE_SEC;
  const T_KAPALBHATI = T_REST_1 + REST_SEC;
  const T_CELEB_2 = T_KAPALBHATI + slot('kapalbhati');
  const T_REST_2 = T_CELEB_2 + CELEBRATE_SEC;
  const T_ANULOM = T_REST_2 + REST_SEC;
  const T_CELEB_3 = T_ANULOM + slot('anulom_vilom');
  const T_REST_3 = T_CELEB_3 + CELEBRATE_SEC;
  const T_BAHYA = T_REST_3 + REST_SEC;
  const T_CELEB_4 = T_BAHYA + slot('bahya');
  const T_REST_4 = T_CELEB_4 + CELEBRATE_SEC;
  const T_BHRAMARI = T_REST_4 + REST_SEC;
  const T_FINALE = T_BHRAMARI + slot('bhramari');
  // The whole-session tally sits between the final congratulation and the course promo,
  // so the last thing you see about your own practice is what you actually did.
  const T_SUMMARY = T_FINALE + CELEBRATE_SEC;
  const T_PROMO = T_SUMMARY + SUMMARY_SEC;

  const starts = [T_BHASTRIKA, T_KAPALBHATI, T_ANULOM, T_BAHYA, T_BHRAMARI];
  const celebs = [T_CELEB_1, T_CELEB_2, T_CELEB_3, T_CELEB_4, T_FINALE];

  return {
    level,
    specs,
    introSec,
    T_BHASTRIKA, T_CELEB_1, T_REST_1, T_KAPALBHATI, T_CELEB_2, T_REST_2,
    T_ANULOM, T_CELEB_3, T_REST_3, T_BAHYA, T_CELEB_4, T_REST_4,
    T_BHRAMARI, T_FINALE, T_SUMMARY, T_PROMO,
    SESSION_SEC: T_PROMO + PROMO_SEC,
    techniques: NAMES.map((n, i) => ({
      ...n,
      index: i + 1,
      startSec: starts[i],
      celebrateSec: celebs[i],
    })),
  };
}

/** mm:ss, or h:mm:ss past an hour — the format YouTube parses as a chapter. */
export function stamp(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return h > 0 ? `${h}:${mm}:${String(r).padStart(2, '0')}` : `${mm}:${String(r).padStart(2, '0')}`;
}

/**
 * YouTube requires the first chapter at 0:00 and at least three chapters, each at
 * least 10s long. Practice start is listed separately from the technique start so a
 * returning viewer can skip the instruction and go straight to breathing.
 */
export function chapters(tl: SessionTimeline): Array<{ at: number; label: string }> {
  const out: Array<{ at: number; label: string }> = [
    { at: 0, label: 'Welcome & what to expect' },
  ];
  for (const t of tl.techniques) {
    const spec = tl.specs[t.type];
    out.push({ at: t.startSec, label: `${t.index}. ${t.title} (${t.sanskrit}) — instructions` });
    // No leading whitespace — YouTube renders the label verbatim in the chapter list.
    out.push({ at: t.startSec + spec.leadInSec, label: `↳ Practice: ${t.title}` });
  }
  out.push({ at: tl.T_FINALE, label: 'Session complete' });
  out.push({ at: tl.T_SUMMARY, label: 'Your session in numbers' });
  out.push({ at: tl.T_PROMO, label: 'Keep practising' });
  return out;
}

/** The beginner timeline, for the original composition and existing imports. */
export const BEGINNER = buildTimeline('beginner');
export const {
  T_BHASTRIKA, T_CELEB_1, T_REST_1, T_KAPALBHATI, T_CELEB_2, T_REST_2,
  T_ANULOM, T_CELEB_3, T_REST_3, T_BAHYA, T_CELEB_4, T_REST_4,
  T_BHRAMARI, T_FINALE, T_SUMMARY, T_PROMO, SESSION_SEC,
} = BEGINNER;
export const TECHNIQUES = BEGINNER.techniques;
