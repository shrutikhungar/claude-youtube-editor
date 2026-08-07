# Handoff — pranayam + untethered soul videos

Start here if you are picking this up in a new session. `git log` has the detailed
reasoning behind each change; this file is the state and the traps.

---

## What exists

| Composition | State | Output |
|---|---|---|
| `Daily5PranayamBeginner` | **done + normalised** | `videos/daily5pranayam.mp4` (29:50) |
| `Daily5PranayamIntermediate` | code + audio ready, **never rendered** | — |
| `WisdomQ6` | built, **1 frame from being verified** | — |
| `MeditationEpisode` | pre-existing, untouched | `remotion/out/Meditation_Ep4.1.mp4` |

Publishing assets for both pranayam levels are generated:
`videos/daily5pranayam*.chapters.txt` and `.srt`.

---

## Architecture (read this before changing pacing)

**One source of truth.** `remotion/src/shots/pranayam/breathPattern.ts` holds
`BEGINNER_SPECS` and `INTERMEDIATE_SPECS`. Everything downstream derives from them:
the ring, the counters, the panel, the chapters, the subtitles and the breathing audio.
Change a protocol there and the whole video reflows.

**Both pranayam videos share one body.** `PranayamSession.tsx` is the entire
implementation; `Daily5PranayamBeginner.tsx` and `Daily5PranayamIntermediate.tsx` are
20-line wrappers that pick a level. Never fork the body — a fix in one must be a fix
in both, and that is only true while they share it.

**Regenerate in this order after any pacing change:**

```
cd remotion && node scripts/gen-publish.mjs   # exports videos/breath-spec.json + chapters + srt
python gen_pranayam_sfx.py                    # rebuilds breath tracks FROM that json
```

`gen_pranayam_sfx.py` asserts each track equals `roundSeconds()` before writing. This
caught real drift once already (Bahya had moved to 88s while its audio was still 84s).

---

## Traps that have already cost hours

1. **`media/` is the public root, not `remotion/public/`.**
   `remotion.config.ts` sets `Config.setPublicDir('../media')`. Anything under
   `remotion/public/` 404s. A missing asset is a **hard render failure**, not a blank
   box — one killed a render at frame 1404 of 53220. Verify every referenced asset
   exists before starting a long render.

2. **Run renders from inside `remotion/`.** Remotion loads `remotion.config.ts` from
   the cwd, and that file sets the browser executable path. From the repo root it tries
   to download a Chrome build that does not exist for Windows ARM64.

3. **Never pipe the render through `tail`/`head`.** You get the pipe's exit code, not
   Remotion's. A failed render reported "completed (exit code 0)" twice. Capture
   `$LASTEXITCODE` / `echo "EXIT=$?"` directly.

4. **`gen-registry.mjs` parses `compositionConfig` statically.** `durationInSeconds`
   must be a literal — a `const` silently becomes 5s. And do not drop `fps`, or
   `durationInFrames` is `NaN`.

5. **Never launch two renders to the same output path.** I did; both wrote
   `daily5pranayam.raw.mp4`. It survived, but only by luck of sequencing.

6. **h264 cannot carry alpha.** `wisdom-2.6-backRemoved.mp4` has a uniform near-white
   background (253,251,252) baked in. `mixBlendMode: 'multiply'` keys it cleanly
   against the cream backdrop.

---

## Design decisions worth not undoing

- **Beginner pacing is deliberate.** Rounds with rest, not unbroken forceful breathing.
  Alternate Nostril uses 4:4:4:2, *not* the 1:4:2 Hatha ratio — a 16s internal hold is
  advanced and was removed on purpose.
- **A round always closes with a deep inhale BEFORE the retention.** You cannot hold
  air in after an exhale.
- **The clock counts practice, not elapsed time.** It stays parked during the spoken
  lead-in so the "5 MINUTES" badge is literally true.
- **One live cue at a time.** The ring owns the countdown; the side panel is reference
  only. Three competing readouts was confusing.
- **`scheduleCues()` books in two tiers** — structural cues (rest, closing retention)
  are guaranteed, per-breath cues fill gaps. Plain earliest-first silently ate "Rest".
- **No per-cycle spoken cues on Bhastrika/Kapalbhati.** A ~2s clip in a 1s phase
  truncates mid-word on every breath.
- **The safety notice on the intro card is not decoration.** This is forceful breathing
  plus retention, published publicly.

---

## Next steps

**Blocked on the user:**
- Concept images for WisdomQ6 → `media/projects/untetheredSoul/Q6/img/`
  (optional; 13 drawn SVG fallbacks already work)
- Confirm WisdomQ6 segment timings. The 6 transcript markers are exact; the beats
  between them are estimates and should be scrubbed in the studio.

**Ready to do:**
1. Render one WisdomQ6 frame (~frame 8700) to check the multiply key and her position.
2. Render `Daily5PranayamIntermediate` (~4–5 hrs, 2.3× beginner) then
   `python tools/normalize_loudness.py <raw> <final>`.
3. Optional: the music bed is an 8-minute clip looping ~3.7× across 30 minutes; the
   loop is audible. `gen_pranayam_music.py` generates a continuous non-repeating bed
   but the user declined running it.

**Known-good render command:**
```
cd remotion
npx remotion render src/index.ts <CompositionId> ../videos/<name>.raw.mp4
python ../tools/normalize_loudness.py ../videos/<name>.raw.mp4 ../videos/<name>.mp4
```
Loudness targets −14 LUFS / −1.5 dBTP, which is what YouTube normalises to. The
beginner mix measured −21.5 LUFS before the pass, so it matters.

---

## Environment

- Public root `media/`; Remotion project in `remotion/`; Python venv at `venv/`.
- `pydub` is unusable (Python 3.13 dropped `audioop`) — audio tooling uses stdlib
  `wave` + ffmpeg.
- Voice is `en-US-MichelleNeural` via edge-tts at `-22%` rate, `-8Hz` pitch, chosen by
  ear from a 9-voice A/B. Intro uses `boundary="WordBoundary"` so the overview card can
  highlight each technique as it is named (`introMarks.ts` is generated, do not edit).
