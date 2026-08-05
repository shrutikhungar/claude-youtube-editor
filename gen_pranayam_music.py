#!/usr/bin/env python3
"""
Generates the ambient bed for the Daily 5 Pranayam session.

The previous bed was an 8-minute clip looped ~3.7 times across a 30-minute video,
which becomes audible as a loop long before the session ends. This synthesises a
single continuous drone for the WHOLE session, so nothing ever repeats.

It stays deliberately plain: a low drone with slowly drifting harmonics and a
shimmer layer that swells over minutes. Every partial has its own slow amplitude
cycle at a period that shares no small common factor with the others, so the
combined texture does not return to the same state within the session.

Synthesised at 22.05 kHz — the content is low-frequency and this halves the memory
for a half-hour render. Written in chunks so the whole thing never sits in RAM;
phase is derived from absolute time, so chunk boundaries are seamless.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
OUT_DIRS = [
    ROOT / "media" / "library" / "music" / "clips",
    ROOT / "remotion" / "public" / "library" / "music" / "clips",
]

SR = 22050
DURATION = 1790.0          # must cover compositionConfig.durationInSeconds (1774s)
CHUNK = 30.0
F0 = 108.0                 # low A-ish drone, under the voice

# (harmonic ratio, amplitude, detune Hz, LFO period s, LFO depth)
# LFO periods are mutually awkward so the texture never re-aligns.
PARTIALS = [
    (0.5,  0.40, 0.00,  173.0, 0.25),
    (1.0,  1.00, 0.00,  131.0, 0.20),
    (1.0,  0.55, 0.11,  197.0, 0.30),   # detuned twin -> slow beating
    (2.0,  0.42, 0.07,  109.0, 0.35),
    (3.0,  0.26, 0.13,  151.0, 0.40),
    (4.0,  0.17, 0.09,   89.0, 0.45),
    (5.0,  0.10, 0.17,  211.0, 0.50),
    (6.0,  0.07, 0.05,  127.0, 0.55),
]

# Higher shimmer, swelling over several minutes.
SHIMMER = [
    (8.0,  0.045, 0.19, 233.0, 0.75),
    (10.0, 0.030, 0.23, 307.0, 0.80),
    (12.0, 0.020, 0.29, 271.0, 0.85),
]

FADE_IN = 12.0
FADE_OUT = 20.0


def render_chunk(t0: float, t1: float) -> np.ndarray:
    t = np.arange(int(t0 * SR), int(t1 * SR), dtype=np.float64) / SR
    out = np.zeros_like(t)

    for ratio, amp, detune, lfo_p, lfo_d in PARTIALS + SHIMMER:
        freq = F0 * ratio + detune
        # Each partial breathes on its own slow cycle.
        lfo = 1.0 - lfo_d + lfo_d * (0.5 + 0.5 * np.sin(2 * np.pi * t / lfo_p))
        out += amp * lfo * np.sin(2 * np.pi * freq * t)

    out /= sum(p[1] for p in PARTIALS) + sum(s[1] for s in SHIMMER)

    # Session-length fades.
    fade = np.ones_like(t)
    fi = t < FADE_IN
    fade[fi] = np.sin(np.pi / 2 * t[fi] / FADE_IN) ** 2
    fo = t > DURATION - FADE_OUT
    fade[fo] = np.cos(np.pi / 2 * (t[fo] - (DURATION - FADE_OUT)) / FADE_OUT) ** 2
    return out * fade


def main() -> None:
    name = "pranayam_bed"
    tmp_wav = ROOT / f"_{name}.wav"

    with wave.open(str(tmp_wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        t = 0.0
        while t < DURATION:
            end = min(DURATION, t + CHUNK)
            chunk = render_chunk(t, end)
            w.writeframes(np.int16(np.clip(chunk, -1, 1) * 32767 * 0.72).tobytes())
            t = end

    first = OUT_DIRS[0] / f"{name}.mp3"
    first.parent.mkdir(parents=True, exist_ok=True)
    # 96k mono is plenty for a low drone and keeps a half-hour bed reasonable in git.
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp_wav),
         "-b:a", "96k", "-ac", "1", str(first)],
        check=True,
    )
    data = first.read_bytes()
    for d in OUT_DIRS[1:]:
        d.mkdir(parents=True, exist_ok=True)
        (d / f"{name}.mp3").write_bytes(data)
    tmp_wav.unlink()
    print(f"{name}.mp3  {DURATION:.0f}s  {len(data) / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
