#!/usr/bin/env python3
import asyncio
from pathlib import Path
import edge_tts
from pydub import AudioSegment

ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "remotion" / "public" / "library" / "audio" / "pranayam"
OUT_DIR.mkdir(parents=True, exist_ok=True)

VOICE = "en-US-AriaNeural"

# ENGLISH-ONLY NARRATION — see the note in gen_pranayam_voice.py. The TTS voice
# cannot pronounce the Sanskrit names, so they are never spoken; they appear on screen only.
TECHNIQUES = {
    "bhastrika": {
        "intro": "Technique one. Bellows Breathing. Sit comfortably with a straight spine. Inhale deeply through your nose, expanding your chest, then exhale forcefully. Maintain a steady, rhythmic pace.",
        "cadence": [("Inhale.", 4), ("Hold breath.", 4), ("Exhale.", 4), ("Hold breath.", 4)],
        "duration_sec": 90
    },
    "kapalbhati": {
        "intro": "Technique two. Skull Shining Breath. Exhale forcefully by contracting your lower abdomen, and allow each inhalation to happen naturally and passively. Keep your shoulders relaxed.",
        "cadence": [("Exhale.", 2), ("Inhale.", 2)],
        "duration_sec": 90
    },
    "anulom_vilom": {
        "intro": "Technique three. Alternate Nostril Breathing. Close your right nostril with your thumb and inhale gently through the left. Close your left nostril and exhale smoothly through the right.",
        "cadence": [("Inhale left.", 4), ("Hold.", 4), ("Exhale right.", 4), ("Inhale right.", 4), ("Exhale left.", 4)],
        "duration_sec": 90
    },
    "bahya": {
        "intro": "Technique four. External Breath Retention. Exhale completely, emptying all air from your lungs. Hold your breath outside and engage your root, abdominal, and throat locks.",
        "cadence": [("Inhale deeply.", 4), ("Exhale completely.", 4), ("Hold outside and engage locks.", 10), ("Release and breathe.", 4)],
        "duration_sec": 90
    },
    "bhramari": {
        "intro": "Technique five. Humming Bee Breath. Place your thumbs on your ears and cover your eyes gently. Inhale deeply, and as you exhale, create a steady, soothing humming sound like a bee.",
        "cadence": [("Inhale deeply.", 4), ("Exhale with humming sound.", 8)],
        "duration_sec": 90
    }
}

async def generate_segment(text: str, filename: str) -> Path:
    out_path = OUT_DIR / filename
    communicate = edge_tts.Communicate(text, VOICE, rate="-5%", pitch="-2Hz")
    await communicate.save(str(out_path))
    return out_path

async def main():
    for key, data in TECHNIQUES.items():
        print(f"Generating full 90s audio track for {key}...")
        # 1. Generate Intro audio
        intro_path = await generate_segment(data["intro"], f"{key}_intro_temp.mp3")
        intro_seg = AudioSegment.from_file(str(intro_path))

        # Start with silence equal to total duration
        total_ms = data["duration_sec"] * 1000
        master_track = AudioSegment.silent(duration=total_ms)

        # Overlay intro at start (t=0)
        master_track = master_track.overlay(intro_seg, position=0)

        # 2. Overlay cadence prompts starting at t = 18s (18,000ms)
        current_time_ms = 18000
        cadence_items = data["cadence"]

        while current_time_ms < total_ms - 5000:
            for text, hold_sec in cadence_items:
                if current_time_ms >= total_ms - 5000:
                    break
                temp_path = await generate_segment(text, "prompt_temp.mp3")
                prompt_seg = AudioSegment.from_file(str(temp_path))
                master_track = master_track.overlay(prompt_seg, position=current_time_ms)
                current_time_ms += int(hold_sec * 1000)

        # Export master audio file
        master_out = OUT_DIR / f"{key}_full_voice.mp3"
        master_track.export(str(master_out), format="mp3")
        print(f"Exported: {master_out.relative_to(ROOT)}")

        # Cleanup temps
        if intro_path.exists(): intro_path.unlink()
        temp_p = OUT_DIR / "prompt_temp.mp3"
        if temp_p.exists(): temp_p.unlink()

if __name__ == "__main__":
    asyncio.run(main())
