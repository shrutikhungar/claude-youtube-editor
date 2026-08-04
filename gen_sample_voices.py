#!/usr/bin/env python3
import asyncio
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "media" / "library" / "audio" / "pranayam"
OUT_DIR.mkdir(parents=True, exist_ok=True)

VOICES = {
    "ava": "en-US-AvaNeural",
    "neerja": "en-IN-NeerjaNeural",
    "sonia": "en-GB-SoniaNeural",
    "aria": "en-US-AriaNeural"
}

SAMPLE_TEXT = "Welcome to Bhastrika Pranayama, or Bellows Breathing. Sit comfortably with a straight spine. Inhale deeply through your nose, expanding your chest, then exhale forcefully."

async def main():
    for key, voice in VOICES.items():
        out_file = OUT_DIR / f"bhastrika_sample_{key}.mp3"
        print(f"Generating voice sample for {key} ({voice})...")
        communicate = edge_tts.Communicate(SAMPLE_TEXT, voice, rate="-12%", pitch="-3Hz")
        await communicate.save(str(out_file))

if __name__ == "__main__":
    asyncio.run(main())
