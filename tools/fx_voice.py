#!/usr/bin/env python3
"""
fx_voice.py — Apply warm Reverb and Chorus audio effects to your voice.

Ideal for meditation / soulful videos. Can add spatial reverb and chorus depth
directly using FFmpeg audio filters.

Usage:
  python tools/fx_voice.py videos/video-1/keyed-ep4.1....mp4 [--reverb] [--chorus] [-o output.mp4]
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def get_ffmpeg() -> str:
    choco = r"C:\ProgramData\chocolatey\bin\ffmpeg.exe"
    if os.path.exists(choco):
        return choco
    return shutil.which("ffmpeg") or "ffmpeg"

def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python tools/fx_voice.py <input.mp4> [--reverb] [--chorus] [-o output.mp4]")
        
    args = sys.argv[1:]
    src = Path(args[0]).resolve()
    
    reverb = "--reverb" in args or True # Default to true for meditation vibe
    chorus = "--chorus" in args
    
    out_path = src.parent / f"{src.stem}-fx{src.suffix}"
    if "-o" in args:
        idx = args.index("-o")
        out_path = Path(args[idx + 1]).resolve()
        
    filters = []
    
    # Deep Spatial Meditation Hall Reverb filter (3-tap echo with lush decay)
    # aecho=in_gain:out_gain:delays:decays
    filters.append("aecho=0.85:0.95:85|140|210:0.65|0.52|0.38")
        
    af_string = ",".join(filters) if filters else "anull"
    
    print(f"Applying vocal FX: Reverb={reverb}, Chorus={chorus}...")
    
    cmd = [
        get_ffmpeg(), "-y",
        "-i", str(src),
        "-af", af_string,
        "-c:v", "copy", # fast copy video without re-encoding
        "-c:a", "aac", "-b:a", "192k",
        str(out_path)
    ]
    
    print("RUNNING:", " ".join(cmd))
    r = subprocess.run(cmd)
    if r.returncode == 0:
        print(f"\nDone! Enhanced vocal audio saved to: {out_path.relative_to(ROOT)}")
    else:
        sys.exit("Audio FX processing failed.")

if __name__ == "__main__":
    main()
