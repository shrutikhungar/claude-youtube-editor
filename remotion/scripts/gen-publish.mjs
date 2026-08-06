#!/usr/bin/env node
/**
 * Generates the publishing assets for BOTH pranayam sessions:
 *
 *   videos/<id>.chapters.txt   paste-ready description with chapter stamps
 *   videos/<id>.srt            subtitles for the spoken guidance
 *   videos/breath-spec.json    phase timings for gen_pranayam_sfx.py
 *
 * All of it derives from sessionTimeline.ts and breathPattern.ts, so a retime reflows
 * every one of them. Never hand-edit the timings — re-run this.
 *
 *   cd remotion && node scripts/gen-publish.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(ROOT, 'remotion/src/shots/pranayam');

/** Bundle a TS module to a data URL so we can import it without a build step. */
async function load(file) {
  const out = await build({
    entryPoints: [join(SRC, file)],
    bundle: true, format: 'esm', platform: 'node', write: false,
  });
  return import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
}

const timeline = await load('sessionTimeline.ts');
const bp = await load('breathPattern.ts');
const { buildTimeline, chapters, stamp } = timeline;
const { SPECS_BY_LEVEL, PRACTICE_SEC_BY_LEVEL, cycleSeconds, breathingSeconds, roundSeconds, practiceSeconds, repsPerRound, totalReps } = bp;

const LEVELS = [
  { level: 'beginner', id: 'daily5pranayam', label: 'Beginner' },
  { level: 'intermediate', id: 'daily5pranayam-intermediate', label: 'Intermediate' },
];

const outDir = join(ROOT, 'videos');
mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------- spec export
//
// gen_pranayam_sfx.py builds one breath track per technique per level, and each track
// has to be exactly roundSeconds() long with the phases at the right offsets. Python
// cannot read the TypeScript specs, and mirroring the numbers by hand silently
// desynchronises the audio the moment a pattern changes.
const specExport = {};
for (const { level } of LEVELS) {
  specExport[level] = {};
  for (const [key, spec] of Object.entries(SPECS_BY_LEVEL[level])) {
    specExport[level][key] = {
      pattern: spec.pattern,
      breathsPerRound: spec.breathsPerRound,
      rounds: spec.rounds,
      endOfRoundInhaleSec: spec.endOfRoundInhaleSec,
      endOfRoundAntarSec: spec.endOfRoundAntarSec,
      endOfRoundBahyaSec: spec.endOfRoundBahyaSec,
      cycleSeconds: cycleSeconds(spec),
      breathingSeconds: breathingSeconds(spec),
      roundSeconds: roundSeconds(spec),
      practiceSeconds: practiceSeconds(spec),
    };
  }
}
writeFileSync(join(outDir, 'breath-spec.json'), JSON.stringify(specExport, null, 2), 'utf8');

// ---------------------------------------------------------------- per level

const srtStamp = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, '0')}`;
};

for (const { level, id, label } of LEVELS) {
  const tl = buildTimeline(level);
  const specs = SPECS_BY_LEVEL[level];
  const practiceMin = Math.round(PRACTICE_SEC_BY_LEVEL[level] / 60);
  const totalMin = Math.round(tl.SESSION_SEC / 60);
  const lines = chapters(tl).map((c) => `${stamp(c.at)} ${c.label}`);

  const levelIntro = level === 'intermediate'
    ? `An intermediate ${totalMin}-minute pranayam session — five classical breathing
techniques, each practised for a full ${practiceMin} minutes, at a faster pace and with
noticeably longer retentions than the beginner session.

This is a step up, not a starting point. Work through the beginner session until it is
comfortable before you attempt this one.`
    : `A complete ${totalMin}-minute guided pranayam session — five classical breathing
techniques, each practised for a full ${practiceMin} minutes, with the pace, the round
count and the rest all on screen so you never have to wonder where you are.

Beginner level throughout. Every technique is broken into short rounds with recovery
between them, and both retentions (antar and bahya kumbhaka) are held at beginner
lengths.`;

  const description = `${levelIntro}

Follow the ring: it shows what to do and how long is left.

⚠️ BEFORE YOU BEGIN
Skip the forceful techniques (Bellows and Skull Shining) if you are pregnant, or have
high blood pressure, heart disease, epilepsy, glaucoma, hernia, or recent abdominal
surgery. Practise on an empty stomach. Never strain — if you feel dizzy, faint or
breathless, stop and breathe normally. This is general wellness content, not medical
advice. Talk to a doctor before starting any new breathing practice.

CHAPTERS
${lines.join('\n')}

WHAT YOU PRACTISE
${tl.techniques.map((t) => {
  const s = specs[t.type];
  const unit = s.repUnit.toLowerCase() + 's';
  return `${t.index}. ${t.title} (${t.sanskrit}) — ${s.rounds} round${s.rounds > 1 ? 's' : ''}, ${totalReps(s)} ${unit}`;
}).join('\n')}

Soulful Intelligence Studio — breathe • observe • transform
Feelings & Emotions Course: skrmblissai.in/FeelingsAndEmotionCourse
MindGym app: skrmblissai.in/mindgym
Custom routine requests: connect@skrmblissai.in
`;

  const srtCues = [
    {
      start: 0,
      end: tl.introSec - 4,
      text: `Welcome to Soulful Intelligence Studio.\nThe ${label} Daily Five breathwork sequence.`,
    },
    ...tl.techniques.map((t) => ({
      start: t.startSec,
      end: t.startSec + specs[t.type].leadInSec - 4,
      text: `Technique ${t.index}. ${t.title}.`,
    })),
  ];

  const srt = srtCues
    .map((c, i) => `${i + 1}\n${srtStamp(c.start)} --> ${srtStamp(c.end)}\n${c.text}\n`)
    .join('\n');

  writeFileSync(join(outDir, `${id}.chapters.txt`), description, 'utf8');
  writeFileSync(join(outDir, `${id}.srt`), srt, 'utf8');

  console.log(`\n${label.toUpperCase()}  (${stamp(tl.SESSION_SEC)})`);
  console.log(`  ${id}.chapters.txt  (${lines.length} chapters)`);
  console.log(`  ${id}.srt           (${srtCues.length} cues)`);
  for (const [k, s] of Object.entries(specExport[level])) {
    const want = PRACTICE_SEC_BY_LEVEL[level];
    const ok = s.practiceSeconds === want ? 'ok' : `!! ${s.practiceSeconds}s, expected ${want}`;
    console.log(`  ${k.padEnd(13)} round ${String(s.roundSeconds).padStart(5)}s x${s.rounds}  ${ok}`);
  }
}

console.log('\nvideos/breath-spec.json  (both levels — feed to gen_pranayam_sfx.py)');
