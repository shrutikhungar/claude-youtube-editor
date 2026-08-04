#!/usr/bin/env python3
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AUDIO_DIR = ROOT / "remotion" / "public" / "library" / "audio" / "pranayam"

print("Checking generated audio files:")
for f in sorted(AUDIO_DIR.glob("*.mp3")):
    size = f.stat().st_size
    print(f" - {f.name}: {size} bytes")
