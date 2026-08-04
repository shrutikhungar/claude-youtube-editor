// Video brand tokens (see /brand.md). Import these in every shot
// so all videos stay consistent; change a value here and every shot updates.
//
// The COLORS / EASINGS / RADIUS below are the house style the example shots were
// built in — a calm, premium look you are free to keep. BRAND, right below, is
// YOUR identity and ships as a placeholder on purpose. Run `/brand-setup` to
// rewrite both this file and /brand.md to your own channel in one pass.
import { Easing } from 'remotion';

// Channel identity. Any shot that puts your name on screen reads it from here,
// so one edit re-brands every video you have ever made in this repo.
export const BRAND = {
  // The wordmark, split in three so the MIDDLE part renders in the accent color.
  // e.g. ['Build', 'With', 'AI'] renders the word "With" in indigo.
  // Use ['Acme', 'Labs', ''] for a two-part mark.
  wordmark: ['Soulful ', 'Intelligence', ''] as readonly string[],
  signoff: 'See you in the next one',
} as const;

export const COLORS = {
  // roles
  accent: '#7a6a58', // deep earthy brown — primary (for high contrast text)
  accent2: '#cfa864', // gold — secondary
  signal: '#d44a40', // deep red — success / "free"
  signalAlt: '#b38f52', // dark gold companion
  warn: '#f5d76e', // yellow — attention
  danger: '#e8879f', // pink — contrast / error
  ink: '#2b2520', // primary text on light (rich dark brown)
  muted: '#75695c', // secondary text
  paper: '#e4d5c3', // warm taupe surface / bg (matches new image)
  cream: '#dcccb9', // alt light band
  line: '#c7baab', // 1px borders on light
  // dark UI / terminal scale (GitHub-ink)
  d900: '#0d1117',
  d800: '#161b22',
  d600: '#30363d',
  d400: '#8b949e',
  d300: '#c9d1d9',
} as const;

// signature gradient: indigo -> violet -> teal
export const GRADIENT = `linear-gradient(120deg, ${COLORS.accent}, ${COLORS.accent2}, ${COLORS.signal})`;

export const RADIUS = { card: 16, panel: 14, window: 10, pill: 999 } as const;

export const SHADOW = {
  soft: '0 8px 32px rgba(26,26,46,0.10)',
  card: '0 10px 40px rgba(26,26,46,0.08)',
} as const;

// Calm, premium easings (confirmed brand motion). Use these — never Easing.out(...) wrappers.
export const EASINGS = {
  easeOut: Easing.bezier(0.33, 1, 0.68, 1),
  easeIn: Easing.bezier(0.32, 0, 0.67, 0),
  easeInOut: Easing.bezier(0.37, 0, 0.63, 1),
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1), // gentle, no cartoon bounce
} as const;
