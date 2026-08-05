#!/usr/bin/env node
/**
 * Generates the YouTube publishing assets for the Daily 5 Pranayam session:
 *
 *   videos/daily5pranayam.chapters.txt  paste-ready description with chapter stamps
 *   videos/daily5pranayam.srt           subtitles for the spoken guidance
 *
 * Both are derived from remotion/src/shots/pranayam/sessionTimeline.ts, so a retime
 * in breathPattern.ts reflows them. Never hand-edit the timings — re-run this.
 *
 *   node scripts/gen-publish.mjs   (from remotion/)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(ROOT, 'remotion/src/shots/pranayam');

// The timeline is TypeScript; bundle it to a data URL module so we can import it
// without a build step or a compiled artifact lying around.
const bundled = await build({
  entryPoints: [join(SRC, 'sessionTimeline.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
});
const mod = await import(
  'data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64')
);

const { TECHNIQUES, chapters, stamp, SESSION_SEC, INTRO_SEC } = mod;
const { PRANAYAM_SPECS } = await (async () => {
  const b = await build({
    entryPoints: [join(SRC, 'breathPattern.ts')],
    bundle: true, format: 'esm', platform: 'node', write: false,
  });
  return import('data:text/javascript;base64,' + Buffer.from(b.outputFiles[0].text).toString('base64'));
})();

// ---------------------------------------------------------------- chapters

const lines = chapters().map((c) => `${stamp(c.at)} ${c.label}`);

const totalMin = Math.round(SESSION_SEC / 60);
const description = `A complete ${totalMin}-minute guided pranayam session — five classical breathing
techniques, each practised for a full five minutes, with the pace, the round count
and the rest all on screen so you never have to wonder where you are.

Beginner level throughout. Every technique is broken into short rounds with recovery
between them, and both retentions (antar and bahya kumbhaka) are held at beginner
lengths. Follow the ring: it shows what to do and how long is left.

⚠️ BEFORE YOU BEGIN
Skip the forceful techniques (Bellows and Skull Shining) if you are pregnant, or have
high blood pressure, heart disease, epilepsy, glaucoma, hernia, or recent abdominal
surgery. Practise on an empty stomach. Never strain — if you feel dizzy, faint or
breathless, stop and breathe normally. This is general wellness content, not medical
advice. Talk to a doctor before starting any new breathing practice.

CHAPTERS
${lines.join('\n')}

WHAT YOU PRACTISE
${TECHNIQUES.map((t) => {
  const s = PRANAYAM_SPECS[t.type];
  const reps = Math.round(s.breathsPerRound / s.turnsPerRep) * s.rounds;
  const unit = s.repUnit.toLowerCase() + 's';
  return `${t.index}. ${t.title} (${t.sanskrit}) — ${s.rounds} rounds, ${reps} ${unit}`;
}).join('\n')}

Soulful Intelligence Studio — breathe • observe • transform
Feelings & Emotions Course: skrmblissai.in/FeelingsAndEmotionCourse
MindGym app: skrmblissai.in/mindgym
Custom routine requests: connect@skrmblissai.in
`;

// ---------------------------------------------------------------- subtitles

// The only speech is the session intro and one instruction per technique. Each is
// captioned as a single cue spanning its spoken window.
const srtCues = [
  { start: 0, end: INTRO_SEC - 4, text: 'Welcome to Soulful Intelligence Studio.\nToday we practise the Daily Five breathwork sequence.' },
  ...TECHNIQUES.map((t) => ({
    start: t.startSec,
    end: t.startSec + PRANAYAM_SPECS[t.type].leadInSec - 4,
    text: `Technique ${t.index}. ${t.title}.`,
  })),
];

const srtStamp = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, '0')}`;
};

const srt = srtCues
  .map((c, i) => `${i + 1}\n${srtStamp(c.start)} --> ${srtStamp(c.end)}\n${c.text}\n`)
  .join('\n');

// ---------------------------------------------------------------- write

const outDir = join(ROOT, 'videos');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'daily5pranayam.chapters.txt'), description, 'utf8');
writeFileSync(join(outDir, 'daily5pranayam.srt'), srt, 'utf8');

console.log(`videos/daily5pranayam.chapters.txt  (${lines.length} chapters)`);
console.log(`videos/daily5pranayam.srt           (${srtCues.length} cues)`);
console.log(`session length ${stamp(SESSION_SEC)}`);
