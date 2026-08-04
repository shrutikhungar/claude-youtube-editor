#!/usr/bin/env python3
import asyncio
import os
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent

SCRIPTS = {
    "intro_voice.mp3": "Welcome to Soulful Intelligence Studio. Today we practice the Daily 5 Pranayam sequence. We will guide you through 5 powerful breathwork techniques: Bhastrika, Kapalbhati, Anulom Vilom, Bahya, and Bhramari Pranayama. Each technique is practiced for a full 5 minutes with 30-second recovery breaks. Let us begin.",
    "bhastrika_voice.mp3": "Welcome to Bhastrika Pranayama, or Bellows Breathing. Sit comfortably with a straight spine. Inhale deeply through your nose, expanding your chest, then exhale forcefully. Maintain a steady, rhythmic cadence. Breathe deeply.",
    "kapalbhati_voice.mp3": "Now we begin Kapalbhati Pranayama, the Skull Shining Breath. Exhale forcefully by contracting your lower abdomen, and allow each inhalation to happen naturally and passively. Keep your shoulders relaxed.",
    "anulom_vilom_voice.mp3": "Transition into Anulom Vilom, Alternate Nostril Breathing. Follow the Hatha ratio of 1:4:2. Close your right nostril with your thumb and inhale through your left nostril. Hold your breath inside, then exhale through your right. Inhale right, hold, and exhale left.",
    "bahya_voice.mp3": "Prepare for Bahya Pranayama, External Breath Retention. Exhale completely, emptying all air from your lungs. Hold your breath outside and gently engage the root, abdominal, and throat locks. Release smoothly before inhaling.",
    "bhramari_voice.mp3": "Finally, Bhramari Pranayama, the Humming Bee Breath. Place your thumbs on your ears and cover your eyes gently. Inhale deeply, and as you exhale, create a steady, soothing humming sound like a bee. Feel the peaceful vibration.",
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

    voice = "en-US-AvaNeural" # Soft, ultra-gentle, meditative female voice

    for filename, text in SCRIPTS.items():
        print(f"Generating Ava voiceover: {filename}...")
        communicate = edge_tts.Communicate(text, voice, rate="-12%", pitch="-3Hz")
        
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
