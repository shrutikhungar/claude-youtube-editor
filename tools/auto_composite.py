#!/usr/bin/env python3
"""
auto_composite.py — Option B Compositor: Taupe background + White keying + Medium Room Reverb.

Usage:
  python tools/auto_composite.py videos/video-1/ep4.1 meditation-esv2-50p-bg-10p-music-10p.mp4
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

def get_ffprobe() -> str:
    choco = r"C:\ProgramData\chocolatey\bin\ffprobe.exe"
    if os.path.exists(choco):
        return choco
    return shutil.which("ffprobe") or "ffprobe"

def run(cmd, cwd=None):
    print("RUNNING:", " ".join(cmd))
    r = subprocess.run(cmd, cwd=cwd)
    if r.returncode != 0:
        sys.exit(f"\nCommand failed: {' '.join(cmd)}")

def duration_of(path: Path) -> float:
    r = subprocess.run(
        [get_ffprobe(), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(r.stdout.strip())

def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python tools/auto_composite.py <path/to/raw-video.mp4>")
        
    raw_vid = Path(sys.argv[1]).resolve()
    if not raw_vid.exists():
        sys.exit(f"File not found: {raw_vid}")
        
    project_dir = raw_vid.parent
    dur_s = duration_of(raw_vid)
    print(f"Video Duration: {dur_s:.2f}s")

    out_mp4 = project_dir / "master_keyed_optionB.mp4"

    # Filter graph:
    # [1:v] key out white background (colorkey=0xFFFFFF:0.08:0.05)
    # [0:v] color background #e4d5c3
    # Overlay keyed speaker over background
    # [1:a] Apply Medium Room Reverb (freeverb)
    fc = (
        "[1:v]colorkey=0xFFFFFF:0.08:0.05[ck];"
        "[0:v][ck]overlay=0:0[v];"
        "[1:a]aecho=0.8:0.88:40:0.3[a]"
    )

    cmd = [
        get_ffmpeg(), "-y",
        "-f", "lavfi", "-i", f"color=c=0xe4d5c3:s=1920x1080:r=30:d={dur_s:.3f}",
        "-i", str(raw_vid),
        "-filter_complex", fc,
        "-map", "[v]",
        "-map", "[a]",
        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        str(out_mp4)
    ]

    run(cmd)
    print(f"\nDone! Option B Master Video ready at: {out_mp4.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
