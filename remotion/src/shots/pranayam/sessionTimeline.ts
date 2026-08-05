/**
 * Master timeline for the Daily 5 Pranayam session.
 *
 * Kept in a plain .ts module (no JSX) so build scripts can import it directly — the
 * YouTube chapter list and the subtitle file are generated from these exact numbers
 * rather than retyped, which is the only way they stay true after a retime.
 *
 * Every technique slot is derived from its spec: spoken lead-in + exactly 300s of
 * practice. Change a protocol in breathPattern.ts and everything here reflows.
 */
import { PranayamType, PRANAYAM_SPECS, totalSeconds } from './breathPattern';

export const INTRO_SEC = 36;        // session intro voice runs 31.8s
export const REST_SEC = 10;         // relaxation between techniques
export const VOICE_WINDOW_SEC = 28; // longest technique intro clip is 23.3s
export const PROMO_SEC = 18;
export const CELEBRATE_SEC = 8;     // congratulation flash after each technique

const slot = (t: PranayamType) => totalSeconds(PRANAYAM_SPECS[t]);

export const T_BHASTRIKA = INTRO_SEC;
export const T_CELEB_1 = T_BHASTRIKA + slot('bhastrika');
export const T_REST_1 = T_CELEB_1 + CELEBRATE_SEC;
export const T_KAPALBHATI = T_REST_1 + REST_SEC;
export const T_CELEB_2 = T_KAPALBHATI + slot('kapalbhati');
export const T_REST_2 = T_CELEB_2 + CELEBRATE_SEC;
export const T_ANULOM = T_REST_2 + REST_SEC;
export const T_CELEB_3 = T_ANULOM + slot('anulom_vilom');
export const T_REST_3 = T_CELEB_3 + CELEBRATE_SEC;
export const T_BAHYA = T_REST_3 + REST_SEC;
export const T_CELEB_4 = T_BAHYA + slot('bahya');
export const T_REST_4 = T_CELEB_4 + CELEBRATE_SEC;
export const T_BHRAMARI = T_REST_4 + REST_SEC;
export const T_FINALE = T_BHRAMARI + slot('bhramari');
export const T_PROMO = T_FINALE + CELEBRATE_SEC;
export const SESSION_SEC = T_PROMO + PROMO_SEC;

export interface TechniqueSlot {
  type: PranayamType;
  index: number;
  /** English name — the video never speaks the Sanskrit. */
  title: string;
  sanskrit: string;
  startSec: number;
  celebrateSec: number;
}

export const TECHNIQUES: TechniqueSlot[] = [
  { type: 'bhastrika', index: 1, title: 'Bellows Breathing', sanskrit: 'Bhastrika', startSec: T_BHASTRIKA, celebrateSec: T_CELEB_1 },
  { type: 'kapalbhati', index: 2, title: 'Skull Shining Breath', sanskrit: 'Kapalbhati', startSec: T_KAPALBHATI, celebrateSec: T_CELEB_2 },
  { type: 'anulom_vilom', index: 3, title: 'Alternate Nostril Breathing', sanskrit: 'Anulom Vilom', startSec: T_ANULOM, celebrateSec: T_CELEB_3 },
  { type: 'bahya', index: 4, title: 'External Breath Retention', sanskrit: 'Bahya', startSec: T_BAHYA, celebrateSec: T_CELEB_4 },
  { type: 'bhramari', index: 5, title: 'Humming Bee Breath', sanskrit: 'Bhramari', startSec: T_BHRAMARI, celebrateSec: T_FINALE },
];

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
export function chapters(): Array<{ at: number; label: string }> {
  const out: Array<{ at: number; label: string }> = [
    { at: 0, label: 'Welcome & what to expect' },
  ];
  for (const t of TECHNIQUES) {
    const spec = PRANAYAM_SPECS[t.type];
    out.push({ at: t.startSec, label: `${t.index}. ${t.title} (${t.sanskrit}) — instructions` });
    // No leading whitespace — YouTube renders the label verbatim in the chapter list.
    out.push({ at: t.startSec + spec.leadInSec, label: `↳ Practice: ${t.title}` });
  }
  out.push({ at: T_FINALE, label: 'Session complete' });
  out.push({ at: T_PROMO, label: 'Keep practising' });
  return out;
}
