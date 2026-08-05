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
    "intro_voice.mp3": "Welcome to Soulful Intelligence Studio. Today we practice the Daily Five breathwork sequence. We will guide you through five powerful breathing techniques: Bellows Breathing, Skull Shining Breath, Alternate Nostril Breathing, External Breath Retention, and Humming Bee Breath. Each technique is practiced for a full five minutes, with thirty second recovery breaks. Let us begin.",
    "bhastrika_voice.mp3": "Technique one. Bellows Breathing. Sit comfortably with a straight spine. Inhale deeply through your nose, then exhale forcefully, at a steady rhythmic pace. At the end of each round, inhale fully and hold the breath in.",
    "kapalbhati_voice.mp3": "Technique two. Skull Shining Breath. Exhale forcefully by contracting your lower abdomen, and allow each inhalation to happen naturally and passively. At the end of each round, inhale fully and hold the breath in.",
    "anulom_vilom_voice.mp3": "Technique three. Alternate Nostril Breathing. Close your right nostril and inhale through the left for four counts. Hold the breath in for four. Exhale through the right for four, then hold the breath out for two. Repeat, leading with the right nostril.",
    "bahya_voice.mp3": "Technique four. External Breath Retention. Exhale completely, emptying all air from your lungs. Hold your breath outside and gently engage the root, abdominal, and throat locks. Release smoothly before inhaling.",
    "bhramari_voice.mp3": "Technique five. Humming Bee Breath. Place your thumbs on your ears and cover your eyes gently. Inhale deeply, pause briefly at the top, then exhale with a steady humming sound like a bee.",
    "cue_inhale.mp3": "Inhale.",
    "cue_exhale.mp3": "Exhale.",
    "cue_hold.mp3": "Hold breath.",
    "cue_inhale_left.mp3": "Inhale through left nostril.",
    "cue_exhale_right.mp3": "Exhale through right nostril.",
    "cue_inhale_right.mp3": "Inhale through right nostril.",
    "cue_exhale_left.mp3": "Exhale through left nostril.",
    "cue_kumbhaka.mp3": "Hold breath inside."
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
        communicate = edge_tts.Communicate(text, voice, rate="-22%", pitch="-8Hz")
        
        # Save to primary directory first
        primary_file = out_dirs[0] / filename
        await communicate.save(str(primary_file))

        # Copy to all target public directories
        file_bytes = primary_file.read_bytes()
        for d in out_dirs[1:]:
            (d / filename).write_bytes(file_bytes)
            
        print(f"Saved & synced {filename} across all audio directories.")

if __name__ == "__main__":
    asyncio.run(generate_all())
