#!/usr/bin/env python3
"""
Normalises a rendered video's audio to the level YouTube plays it back at.

YouTube normalises everything to roughly -14 LUFS. An un-normalised mix gets turned
down by an amount you did not choose, which flattens dynamics and makes the video sit
quieter than other channels. Doing it deliberately here means the mix you approved is
the mix people hear.

Two-pass loudnorm: measure the real values first, then apply with those measurements
so the correction is linear rather than the dynamic single-pass version, which pumps.
The video stream is copied, never re-encoded — this only touches audio.

    python tools/normalize_loudness.py videos/daily5pranayam.raw.mp4 videos/daily5pranayam.mp4
"""
import json
import re
import subprocess
import sys
from pathlib import Path

TARGET_I = -14.0    # LUFS — YouTube's playback normalisation target
TARGET_TP = -1.5    # dBTP ceiling, leaves headroom for lossy re-encoding
TARGET_LRA = 11.0   # loudness range


def measure(src: Path) -> dict:
    print("Pass 1/2 — measuring…")
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(src),
         "-af", f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
         "-f", "null", "-"],
        capture_output=True, text=True,
    )
    # ffmpeg prints the JSON block at the end of stderr.
    match = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", proc.stderr, re.S)
    if not match:
        sys.exit("Could not read loudnorm measurements from ffmpeg:\n" + proc.stderr[-2000:])
    return json.loads(match.group(0))


def apply(src: Path, dst: Path, m: dict) -> None:
    print("Pass 2/2 — applying…")
    af = (
        f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}"
        f":measured_I={m['input_i']}:measured_TP={m['input_tp']}"
        f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
        f":offset={m['target_offset']}:linear=true:print_format=summary"
    )
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-y", "-i", str(src),
         "-map", "0:v", "-map", "0:a",
         "-c:v", "copy",              # never re-encode the picture
         "-af", af,
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
         str(dst)],
        check=True,
    )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    if not src.exists():
        sys.exit(f"{src} does not exist — render first.")

    m = measure(src)
    print(f"  measured  {float(m['input_i']):.1f} LUFS   peak {float(m['input_tp']):.1f} dBTP")
    print(f"  target    {TARGET_I:.1f} LUFS   peak {TARGET_TP:.1f} dBTP")
    apply(src, dst, m)

    size = dst.stat().st_size / 1024 / 1024
    print(f"\n{dst}  ({size:.0f} MB)")
