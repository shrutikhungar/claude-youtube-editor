#!/usr/bin/env python3
import asyncio
import os
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent

# ENGLISH-ONLY NARRATION.
# The TTS voice mangles the Sanskrit names (Bhastrika, Kapalbhati, Anulom Vilom,
# Bahya, Bhramari, Pranayama), so the spoken track uses the English names only.
# The Sanskrit titles still appear ON SCREEN via PranayamCard — do not put them back
# into these strings.
SCRIPTS = {
    # NB: does not name a rest length — the breaks are 10s now and a spoken "thirty
    # seconds" would contradict the screen. Keep it qualitative so a retime can't
    # make the narration wrong.
    "intro_voice.mp3": "Welcome to Soulful Intelligence Studio. Today we practice the Daily Five breathwork sequence. We will guide you through five powerful breathing techniques: Bellows Breathing, Skull Shining Breath, Alternate Nostril Breathing, External Breath Retention, and Humming Bee Breath. Each technique is practiced for a full five minutes, with guided rest after every round. Let us begin.",
    "bhastrika_voice.mp3": "Technique one. Bellows Breathing. Sit comfortably with a straight spine. Inhale deeply through your nose, then exhale forcefully, at a steady rhythmic pace. At the end of each round, inhale fully and hold the breath in.",
    "kapalbhati_voice.mp3": "Technique two. Skull Shining Breath. Exhale forcefully by contracting your lower abdomen, and allow each inhalation to happen naturally and passively. At the end of each round, inhale fully and hold the breath in.",
    "anulom_vilom_voice.mp3": "Technique three. Alternate Nostril Breathing. Close your right nostril and inhale through the left for four counts. Hold the breath in for four. Exhale through the right for four, then hold the breath out for two. Repeat, leading with the right nostril.",
    "bahya_voice.mp3": "Technique four. External Breath Retention. Exhale completely, emptying all air from your lungs. Hold your breath outside and gently engage the root, abdominal, and throat locks. Release smoothly before inhaling.",
    "bhramari_voice.mp3": "Technique five. Humming Bee Breath. Place your thumbs on your ears and cover your eyes gently. Inhale deeply, pause briefly at the top, then exhale with a steady humming sound like a bee.",
    # STRUCTURAL cues only. The per-cycle clips ("Inhale." / "Exhale.") were removed:
    # repeated over a five-minute technique they read as chatter. These three fire at
    # the transitions instead — roughly once a minute — where the practitioner has
    # their eyes closed and genuinely cannot tell what happens next.
    # Do NOT add per-breath cues back.
    "cue_inhale_hold.mp3": "Now inhale fully, and hold the breath in.",
    "cue_release.mp3": "Release, and breathe normally.",
    "cue_relax.mp3": "Beautifully done. Relax, and let the breath settle.",

    # Per-phase cues. Only fired where the phase is long enough to hold a spoken word
    # (>= 2s) — see PHASE_CUE_MIN_SEC in Daily5Pranayam.tsx. Kept to single words so
    # they land inside the phase rather than running over into the next one.
    "cue_inhale.mp3": "Inhale.",
    "cue_exhale.mp3": "Exhale.",
    "cue_hold.mp3": "Hold.",
    "cue_rest.mp3": "Rest.",
    "cue_inhale_left.mp3": "Inhale, left.",
    "cue_exhale_right.mp3": "Exhale, right.",
    "cue_inhale_right.mp3": "Inhale, right.",
    "cue_exhale_left.mp3": "Exhale, left.",

    # Spoken once on the first breath of each round, matching the on-screen affirmation.
    # Trimmed to fit the 4.5s window the composition gives them.
    "affirmation_inhale.mp3": "Absorb pure life force and healing energy.",
    "affirmation_exhale.mp3": "Release all stress, tension and heavy thoughts.",
}

async def generate_all():
    out_dirs = [
        ROOT / "media" / "library" / "audio" / "pranayam",
        ROOT / "media" / "pranayam",
        ROOT / "remotion" / "public" / "library" / "audio" / "pranayam",
        ROOT / "remotion" / "public" / "pranayam"
    ]

    for d in out_dirs:
        d.mkdir(parents=True, exist_ok=True)

    # Michelle — chosen by ear from a nine-voice A/B at these exact settings, not from
    # the personality tags. Slowed and pitched down for a settling, unhurried read.
    voice = "en-US-MichelleNeural"

    for filename, text in SCRIPTS.items():
        print(f"Generating voiceover: {filename}...")
        # edge-tts defaults to SentenceBoundary, which is far too coarse to light up
        # individual technique names — ask for word-level events on the intro.
        boundary = "WordBoundary" if filename == "intro_voice.mp3" else "SentenceBoundary"
        communicate = edge_tts.Communicate(
            text, voice, rate="-22%", pitch="-8Hz", boundary=boundary
        )

        primary_file = out_dirs[0] / filename

        if filename == "intro_voice.mp3":
            # Stream instead of save() so the word-boundary events come through with
            # the audio. They are what lets the overview card light each technique up
            # exactly as it is spoken, instead of guessing at the timings.
            marks = []
            with open(primary_file, "wb") as f:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        marks.append((chunk["offset"] / 10_000_000, chunk["text"]))
            write_intro_marks(marks)
        else:
            await communicate.save(str(primary_file))

        # Copy to all target public directories
        file_bytes = primary_file.read_bytes()
        for d in out_dirs[1:]:
            (d / filename).write_bytes(file_bytes)

        print(f"Saved & synced {filename} across all audio directories.")


# Words that begin each technique's spoken name, in session order.
NAME_ANCHORS = ["Bellows", "Skull", "Alternate", "External", "Humming"]


def write_intro_marks(marks):
    """Emit the spoken timings the SessionOverviewCard highlights against."""
    def first_at(word, after=0.0):
        for t, w in marks:
            if t >= after and w.strip().strip(",.:").lower() == word.lower():
                return t
        return None

    technique_marks = []
    cursor = 0.0
    for anchor in NAME_ANCHORS:
        t = first_at(anchor, cursor)
        if t is None:
            print(f"  !! '{anchor}' not found in the intro narration — check the script")
            t = 0.0
        technique_marks.append(round(t, 2))
        cursor = t + 0.01

    # "…for a full five minutes" — highlight from the number, not the noun.
    minutes_at = first_at("minutes")
    duration_mark = None
    if minutes_at is not None:
        earlier = [t for t, _ in marks if t < minutes_at]
        duration_mark = round(earlier[-1], 2) if earlier else round(minutes_at, 2)

    out = ROOT / "remotion" / "src" / "shots" / "pranayam" / "introMarks.ts"
    out.write_text(
        "// GENERATED by gen_pranayam_voice.py — do not edit by hand.\n"
        "// Spoken word timings from the TTS engine's own word-boundary events, so the\n"
        "// intro card highlights each technique at the exact moment it is named.\n\n"
        f"export const INTRO_TECHNIQUE_MARKS: number[] = {technique_marks};\n\n"
        "/** When \"five minutes\" is spoken, for the duration badges. */\n"
        f"export const INTRO_DURATION_MARK: number | null = {duration_mark if duration_mark is not None else 'null'};\n\n"
        "/** How long each highlight stays lit. */\n"
        "export const INTRO_HIGHLIGHT_SEC = 2.2;\n",
        encoding="utf-8",
    )
    print(f"  marks -> {out.relative_to(ROOT)}  techniques={technique_marks} duration={duration_mark}")


if __name__ == "__main__":
    asyncio.run(generate_all())
