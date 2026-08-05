#!/usr/bin/env python3
"""
Synthesises the two guidance sounds that replace spoken cues:

  bhramari_hum.mp3       one 6s humming-bee exhale
  kapalbhati_strokes.mp3 one full round of forceful exhale strokes

Both are synthesised rather than sampled so they line up exactly with the timings in
remotion/src/shots/pranayam/breathPattern.ts.

!! These constants MIRROR PRANAYAM_SPECS. If you change bhramari.pattern.exhale or
!! kapalbhati.breathsPerRound, re-run this script.

Written with the stdlib `wave` module and converted by ffmpeg — pydub is unusable on
Python 3.13+ because `audioop` was removed from the standard library.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
OUT_DIRS = [
    ROOT / "remotion" / "public" / "library" / "audio" / "pranayam",
    ROOT / "media" / "library" / "audio" / "pranayam",
]

SR = 44100

# --- mirrors PRANAYAM_SPECS.bhramari ---
HUM_SEC = 10.0           # pattern.exhale
# --- mirrors PRANAYAM_SPECS.kapalbhati ---
STROKE_COUNT = 40        # breathsPerRound
STROKE_SPACING = 1.0     # pattern.exhale (1 stroke/sec)


def write_mp3(samples: np.ndarray, name: str, gain: float = 0.85) -> None:
    """Write float samples (-1..1) out as mp3 to every target directory."""
    pcm = np.int16(np.clip(samples, -1, 1) * 32767 * gain)
    tmp_wav = ROOT / f"_{name}.wav"
    with wave.open(str(tmp_wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())

    first = OUT_DIRS[0] / f"{name}.mp3"
    first.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp_wav), "-b:a", "192k", str(first)],
        check=True,
    )
    data = first.read_bytes()
    for d in OUT_DIRS[1:]:
        d.mkdir(parents=True, exist_ok=True)
        (d / f"{name}.mp3").write_bytes(data)
    tmp_wav.unlink()
    print(f"Exported {name}.mp3 ({len(data) / 1024:.0f} KB)")


def bhramari_hum() -> np.ndarray:
    """A sustained nasal 'mmmm': low fundamental, strong low harmonics, slow vibrato,
    and a faint amplitude buzz for the bee quality."""
    f0 = 150.0
    harmonics = [1.0, 0.52, 0.28, 0.15, 0.08, 0.04]
    vibrato_hz, vibrato_depth = 5.2, 0.012
    buzz_hz, buzz_depth = 26.0, 0.09
    attack, release = 0.40, 0.70

    t = np.linspace(0, HUM_SEC, int(SR * HUM_SEC), endpoint=False)

    # Vibrato applied to phase, so pitch drifts smoothly instead of stepping.
    vib = vibrato_depth * np.sin(2 * np.pi * vibrato_hz * t) / (2 * np.pi * vibrato_hz)
    phase = 2 * np.pi * f0 * (t + vib)

    tone = sum(amp * np.sin(n * phase) for n, amp in enumerate(harmonics, start=1))
    tone /= sum(harmonics)
    tone *= 1.0 - buzz_depth + buzz_depth * np.sin(2 * np.pi * buzz_hz * t)

    # Breathe in and out with the exhale rather than clicking on.
    env = np.ones_like(t)
    a, r = int(attack * SR), int(release * SR)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[-r:] = np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return tone * env


def kapalbhati_strokes() -> np.ndarray:
    """One round of sharp nasal exhales. Each stroke is a band-limited noise burst with
    a near-instant attack and a fast decay — the sound of the abdomen snapping in."""
    total = STROKE_COUNT * STROKE_SPACING
    out = np.zeros(int(SR * total))

    burst_sec = 0.28
    n = int(SR * burst_sec)
    bt = np.linspace(0, burst_sec, n, endpoint=False)

    rng = np.random.default_rng(7)  # fixed seed keeps renders reproducible
    for i in range(STROKE_COUNT):
        noise = rng.standard_normal(n)
        # Cheap band-pass: smooth to kill fizz, then remove the rumbling mean.
        smooth = np.convolve(noise, np.ones(8) / 8, mode="same")
        body = smooth - np.convolve(smooth, np.ones(220) / 220, mode="same")

        # 4ms attack, exponential decay — percussive, not a whoosh.
        env = np.exp(-bt / 0.055)
        atk = int(SR * 0.004)
        env[:atk] *= np.linspace(0, 1, atk)

        start = int(i * STROKE_SPACING * SR)
        out[start:start + n] += body * env

    peak = np.max(np.abs(out))
    return out / peak if peak > 0 else out


def completion_chime() -> np.ndarray:
    """A singing-bowl style chime for the end-of-technique flash. Bell partials are
    inharmonic (0.5 / 1 / 1.2 / 1.5 / 2 / 2.5 / 3), and lower partials ring longer,
    which is what makes it read as a bowl rather than an organ note."""
    dur = 4.5
    f0 = 528.0
    partials = [
        # (ratio, amplitude, decay seconds)
        (0.50, 0.55, 3.4),
        (1.00, 1.00, 2.6),
        (1.20, 0.45, 1.8),
        (1.50, 0.35, 1.4),
        (2.00, 0.28, 1.0),
        (2.50, 0.16, 0.7),
        (3.00, 0.10, 0.5),
    ]

    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    out = np.zeros_like(t)
    for ratio, amp, decay in partials:
        out += amp * np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t / decay)
    out /= sum(p[1] for p in partials)

    # Soft 3ms strike so it does not click.
    atk = int(SR * 0.003)
    out[:atk] *= np.linspace(0, 1, atk)
    return out


if __name__ == "__main__":
    write_mp3(bhramari_hum(), "bhramari_hum", gain=0.85)
    write_mp3(kapalbhati_strokes(), "kapalbhati_strokes", gain=0.55)
    write_mp3(completion_chime(), "completion_chime", gain=0.80)
