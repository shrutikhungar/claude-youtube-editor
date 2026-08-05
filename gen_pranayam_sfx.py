#!/usr/bin/env python3
"""
Synthesises the breathing audio that guides the practice with your eyes closed.

Produces ONE track per technique covering a single round, laid out to the exact
phase timings in remotion/src/shots/pranayam/breathPattern.ts:

  bhastrika_round.mp3    21 forceful in/out pairs, then the closing inhale + hold
  kapalbhati_round.mp3   40 sharp exhale strokes, then the closing inhale + hold
  anulom_round.mp3       10 turns of soft nasal breathing (holds silent)
  bahya_round.mp3        6 breaths with the external retention silent
  bhramari_round.mp3     9 inhale + humming-bee exhales
  completion_chime.mp3   singing bowl for the end-of-technique flash

!! ROUNDS MIRROR PRANAYAM_SPECS. Change a pattern or breathsPerRound there and
!! re-run this script — the printed round length must match roundSeconds().

Breath is synthesised from band-limited noise rather than sampled. It is a
compromise: a real recorded breath would sound better, but this stays exactly in
sync with the on-screen ring and needs no external asset.

Written with the stdlib `wave` module and converted by ffmpeg — pydub is unusable on
Python 3.13+ because `audioop` was removed from the standard library.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
OUT_DIRS = [
    ROOT / "media" / "library" / "audio" / "pranayam",
    ROOT / "remotion" / "public" / "library" / "audio" / "pranayam",
]

SR = 44100
RNG = np.random.default_rng(7)  # fixed seed keeps renders reproducible


# --------------------------------------------------------------------------------------
# building blocks
# --------------------------------------------------------------------------------------

def band_noise(n: int, lo_hz: float, hi_hz: float) -> np.ndarray:
    """Cheap band-pass noise: smooth to set the top of the band, then subtract a
    slower smoothing to remove everything below the bottom of the band."""
    noise = RNG.standard_normal(n + 4096)
    k_hi = max(2, int(SR / hi_hz))
    k_lo = max(k_hi + 2, int(SR / lo_hz))
    low = np.convolve(noise, np.ones(k_hi) / k_hi, mode="same")
    band = low - np.convolve(low, np.ones(k_lo) / k_lo, mode="same")
    band = band[2048:2048 + n]
    peak = np.max(np.abs(band))
    return band / peak if peak > 0 else band


def breath(dur: float, kind: str, force: float = 1.0) -> np.ndarray:
    """One nasal breath.

    Inhale swells to a peak past the middle; exhale hits early and tails off. The
    inhale sits a little brighter than the exhale, which is what makes the two
    readable as different actions without looking at the screen.
    """
    n = int(SR * dur)
    x = np.linspace(0, 1, n, endpoint=False)

    if kind == "in":
        lo, hi = 320.0, 1500.0
        env = np.sin(np.pi * x ** 0.85) ** 1.3
    else:
        lo, hi = 220.0, 1050.0
        env = np.sin(np.pi * x ** 1.35) ** 1.2

    if force > 1.0:  # bhastrika / kapalbhati are sharper and wider band
        lo, hi = lo * 0.8, hi * 1.7
        env = env ** 0.75

    return band_noise(n, lo, hi) * env * force


def hum(dur: float) -> np.ndarray:
    """Bhramari: a sustained nasal 'mmmm'. Low fundamental with strong low harmonics,
    slow vibrato, and a faint amplitude buzz for the bee quality."""
    f0 = 150.0
    harmonics = [1.0, 0.52, 0.28, 0.15, 0.08, 0.04]
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)

    vib = 0.012 * np.sin(2 * np.pi * 5.2 * t) / (2 * np.pi * 5.2)
    phase = 2 * np.pi * f0 * (t + vib)
    tone = sum(a * np.sin(k * phase) for k, a in enumerate(harmonics, start=1))
    tone /= sum(harmonics)
    tone *= 0.91 + 0.09 * np.sin(2 * np.pi * 26.0 * t)

    env = np.ones_like(t)
    a, r = int(0.40 * SR), int(0.70 * SR)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[-r:] = np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return tone * env


def stroke() -> np.ndarray:
    """Kapalbhati: the abdomen snapping in. Near-instant attack, fast decay."""
    dur = 0.28
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    env = np.exp(-t / 0.055)
    atk = int(SR * 0.004)
    env[:atk] *= np.linspace(0, 1, atk)
    return band_noise(n, 260.0, 3200.0) * env


def place(track: np.ndarray, clip: np.ndarray, at_sec: float) -> None:
    """Mix `clip` into `track` starting at `at_sec`, clipped to the track length."""
    start = int(at_sec * SR)
    end = min(len(track), start + len(clip))
    if start < len(track):
        track[start:end] += clip[:end - start]


# --------------------------------------------------------------------------------------
# per-technique rounds — these mirror PRANAYAM_SPECS
# --------------------------------------------------------------------------------------

def bhastrika_round() -> np.ndarray:
    breaths, inh, exh = 21, 1.0, 1.0
    end_inhale, end_hold = 4.0, 6.0
    total = breaths * (inh + exh) + end_inhale + end_hold
    track = np.zeros(int(SR * total))
    for i in range(breaths):
        t0 = i * (inh + exh)
        place(track, breath(inh, "in", force=1.25), t0)
        place(track, breath(exh, "out", force=1.35), t0 + inh)
    # Closing deep inhale; the retention itself is silent.
    place(track, breath(end_inhale, "in", force=0.85), breaths * (inh + exh))
    return track


def kapalbhati_round() -> np.ndarray:
    strokes, spacing = 40, 1.0
    end_inhale, end_hold = 4.0, 8.0
    total = strokes * spacing + end_inhale + end_hold
    track = np.zeros(int(SR * total))
    for i in range(strokes):
        place(track, stroke(), i * spacing)
    place(track, breath(end_inhale, "in", force=0.85), strokes * spacing)
    return track


def anulom_round() -> np.ndarray:
    turns = 10
    inh, hold_in, exh, hold_out = 4.0, 4.0, 4.0, 2.0
    cycle = inh + hold_in + exh + hold_out
    track = np.zeros(int(SR * turns * cycle))
    for i in range(turns):
        t0 = i * cycle
        place(track, breath(inh, "in", force=0.55), t0)
        place(track, breath(exh, "out", force=0.55), t0 + inh + hold_in)
    return track


def bahya_round() -> np.ndarray:
    breaths = 6
    inh, exh, hold_out = 4.0, 4.0, 6.0
    cycle = inh + exh + hold_out
    track = np.zeros(int(SR * breaths * cycle))
    for i in range(breaths):
        t0 = i * cycle
        place(track, breath(inh, "in", force=0.7), t0)
        place(track, breath(exh, "out", force=0.8), t0 + inh)
    return track


def bhramari_round() -> np.ndarray:
    breaths = 9
    inh, hold_in, hum_sec = 4.0, 2.0, 10.0
    cycle = inh + hold_in + hum_sec
    track = np.zeros(int(SR * breaths * cycle))
    for i in range(breaths):
        t0 = i * cycle
        place(track, breath(inh, "in", force=0.5), t0)
        place(track, hum(hum_sec) * 0.85, t0 + inh + hold_in)
    return track


def completion_chime() -> np.ndarray:
    """Singing-bowl chime. Bell partials are inharmonic and lower partials ring
    longer, which is what makes it read as a bowl rather than an organ note."""
    dur, f0 = 4.5, 528.0
    partials = [(0.50, 0.55, 3.4), (1.00, 1.00, 2.6), (1.20, 0.45, 1.8),
                (1.50, 0.35, 1.4), (2.00, 0.28, 1.0), (2.50, 0.16, 0.7),
                (3.00, 0.10, 0.5)]
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    out = np.zeros_like(t)
    for ratio, amp, decay in partials:
        out += amp * np.sin(2 * np.pi * f0 * ratio * t) * np.exp(-t / decay)
    out /= sum(p[1] for p in partials)
    atk = int(SR * 0.003)
    out[:atk] *= np.linspace(0, 1, atk)
    return out


# --------------------------------------------------------------------------------------

def write_mp3(samples: np.ndarray, name: str, gain: float = 0.85) -> None:
    peak = np.max(np.abs(samples))
    if peak > 0:
        samples = samples / peak
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
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp_wav), "-b:a", "160k", str(first)],
        check=True,
    )
    data = first.read_bytes()
    for d in OUT_DIRS[1:]:
        d.mkdir(parents=True, exist_ok=True)
        (d / f"{name}.mp3").write_bytes(data)
    tmp_wav.unlink()
    print(f"  {name}.mp3  {len(pcm) / SR:7.1f}s  {len(data) / 1024:6.0f} KB")


if __name__ == "__main__":
    print("Round tracks (length must equal roundSeconds() in breathPattern.ts):")
    write_mp3(bhastrika_round(), "bhastrika_round", gain=0.62)
    write_mp3(kapalbhati_round(), "kapalbhati_round", gain=0.58)
    write_mp3(anulom_round(), "anulom_round", gain=0.55)
    write_mp3(bahya_round(), "bahya_round", gain=0.58)
    write_mp3(bhramari_round(), "bhramari_round", gain=0.70)
    print("Other:")
    write_mp3(completion_chime(), "completion_chime", gain=0.80)
