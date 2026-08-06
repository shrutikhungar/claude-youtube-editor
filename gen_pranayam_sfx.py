#!/usr/bin/env python3
"""
Synthesises the breathing audio that guides the practice with your eyes closed.

Produces ONE track per technique covering a single round, laid out to the phase
timings of that technique. The timings are READ from videos/breath-spec.json, which
is exported by remotion/scripts/gen-publish.mjs straight out of breathPattern.ts —
so the audio cannot drift out of sync with the video when a pattern changes.

    cd remotion && node scripts/gen-publish.mjs     # refresh the spec
    python gen_pranayam_sfx.py                      # rebuild the tracks

Each track's length is asserted equal to roundSeconds() before it is written.

Breath is synthesised from band-limited noise rather than sampled. It is a
compromise: a real recorded breath would sound better, but this stays exactly in
sync and needs no external asset.

Written with the stdlib `wave` module and converted by ffmpeg — pydub is unusable on
Python 3.13+ because `audioop` was removed from the standard library.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
SPEC_PATH = ROOT / "videos" / "breath-spec.json"
# Beginner tracks sit at the root of the pranayam folder; intermediate in a subfolder,
# matching the audio() helper in PranayamSession.tsx.
BASE_DIRS = [
    ROOT / "media" / "library" / "audio" / "pranayam",
    ROOT / "remotion" / "public" / "library" / "audio" / "pranayam",
]

def out_dirs(level: str):
    return [d if level == "beginner" else d / "intermediate" for d in BASE_DIRS]

SR = 44100
RNG = np.random.default_rng(7)  # fixed seed keeps renders reproducible

# How each technique's exhale should sound, and how loud the whole track sits.
#   voice: 'breath' | 'stroke' | 'hum'
VOICES = {
    "bhastrika":    {"voice": "breath", "in_force": 1.25, "out_force": 1.35, "gain": 0.62},
    "kapalbhati":   {"voice": "stroke", "in_force": 0.85, "out_force": 1.00, "gain": 0.58},
    "anulom_vilom": {"voice": "breath", "in_force": 0.55, "out_force": 0.55, "gain": 0.55},
    "bahya":        {"voice": "breath", "in_force": 0.70, "out_force": 0.80, "gain": 0.58},
    "bhramari":     {"voice": "hum",    "in_force": 0.50, "out_force": 0.85, "gain": 0.70},
}

OUT_NAMES = {
    "bhastrika": "bhastrika_round",
    "kapalbhati": "kapalbhati_round",
    "anulom_vilom": "anulom_round",
    "bahya": "bahya_round",
    "bhramari": "bhramari_round",
}


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
    """One nasal breath. Inhale swells to a peak past the middle; exhale hits early
    and tails off. The inhale sits brighter than the exhale, which is what makes the
    two readable as different actions without looking at the screen."""
    n = int(SR * dur)
    if n <= 0:
        return np.zeros(0)
    x = np.linspace(0, 1, n, endpoint=False)

    if kind == "in":
        lo, hi = 320.0, 1500.0
        env = np.sin(np.pi * x ** 0.85) ** 1.3
    else:
        lo, hi = 220.0, 1050.0
        env = np.sin(np.pi * x ** 1.35) ** 1.2

    if force > 1.0:  # bhastrika is sharper and wider band
        lo, hi = lo * 0.8, hi * 1.7
        env = env ** 0.75

    return band_noise(n, lo, hi) * env * force


def hum(dur: float, force: float = 1.0) -> np.ndarray:
    """Bhramari: a sustained nasal 'mmmm'. Low fundamental with strong low harmonics,
    slow vibrato, and a faint amplitude buzz for the bee quality."""
    n = int(SR * dur)
    if n <= 0:
        return np.zeros(0)
    f0 = 150.0
    harmonics = [1.0, 0.52, 0.28, 0.15, 0.08, 0.04]
    t = np.linspace(0, dur, n, endpoint=False)

    vib = 0.012 * np.sin(2 * np.pi * 5.2 * t) / (2 * np.pi * 5.2)
    phase = 2 * np.pi * f0 * (t + vib)
    tone = sum(a * np.sin(k * phase) for k, a in enumerate(harmonics, start=1))
    tone /= sum(harmonics)
    tone *= 0.91 + 0.09 * np.sin(2 * np.pi * 26.0 * t)

    # Breathe in and out with the exhale rather than clicking on. Scaled to the phase
    # length so a long hum still opens and closes smoothly.
    env = np.ones_like(t)
    a = min(int(0.40 * SR), n // 4)
    r = min(int(0.70 * SR), n // 3)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    env[-r:] = np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return tone * env * force


def stroke(force: float = 1.0) -> np.ndarray:
    """Kapalbhati: the abdomen snapping in. Near-instant attack, fast decay.
    Fixed length regardless of the phase — it is a percussive hit, not a sustained
    sound, so it does not stretch when the stroke rate changes."""
    dur = 0.28
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    env = np.exp(-t / 0.055)
    atk = int(SR * 0.004)
    env[:atk] *= np.linspace(0, 1, atk)
    return band_noise(n, 260.0, 3200.0) * env * force


def place(track: np.ndarray, clip: np.ndarray, at_sec: float) -> None:
    start = int(at_sec * SR)
    end = min(len(track), start + len(clip))
    if start < len(track) and end > start:
        track[start:end] += clip[:end - start]


# --------------------------------------------------------------------------------------

def build_round(key: str, spec: dict) -> np.ndarray:
    """One round of a technique, built entirely from its exported phase timings."""
    cfg = VOICES[key]
    pat = spec["pattern"]
    cycle = spec["cycleSeconds"]
    round_len = spec["roundSeconds"]

    track = np.zeros(int(SR * round_len))

    for i in range(spec["breathsPerRound"]):
        t0 = i * cycle

        if pat["inhale"] > 0:
            place(track, breath(pat["inhale"], "in", cfg["in_force"]), t0)

        # hold1 is silent — a retention makes no sound.
        exhale_at = t0 + pat["inhale"] + pat["hold1"]
        if pat["exhale"] > 0:
            if cfg["voice"] == "stroke":
                place(track, stroke(cfg["out_force"]), exhale_at)
            elif cfg["voice"] == "hum":
                place(track, hum(pat["exhale"], cfg["out_force"]), exhale_at)
            else:
                place(track, breath(pat["exhale"], "out", cfg["out_force"]), exhale_at)
        # hold2 is silent.

    # The round closes with a deliberate deep inhale; the retention after it is silent.
    if spec["endOfRoundInhaleSec"] > 0:
        place(track, breath(spec["endOfRoundInhaleSec"], "in", 0.85), spec["breathingSeconds"])

    return track


def write_mp3(samples: np.ndarray, name: str, gain: float, level: str = "beginner") -> None:
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

    dirs = out_dirs(level)
    first = dirs[0] / f"{name}.mp3"
    first.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp_wav), "-b:a", "160k", str(first)],
        check=True,
    )
    data = first.read_bytes()
    for d in dirs[1:]:
        d.mkdir(parents=True, exist_ok=True)
        (d / f"{name}.mp3").write_bytes(data)
    tmp_wav.unlink()
    print(f"  {name + '.mp3':<24} {len(pcm) / SR:7.1f}s  {len(data) / 1024:6.0f} KB")


def completion_chime() -> np.ndarray:
    """Singing-bowl chime for the end-of-technique flash. Bell partials are inharmonic
    and lower partials ring longer, which is what makes it read as a bowl."""
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


if __name__ == "__main__":
    if not SPEC_PATH.exists():
        sys.exit(f"{SPEC_PATH} missing — run `cd remotion && node scripts/gen-publish.mjs` first.")

    by_level = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
    wanted = sys.argv[1:] or list(by_level.keys())

    for level in wanted:
        specs = by_level[level]
        print(f"\n{level.upper()} round tracks (from {SPEC_PATH.name}):")
        for key, spec in specs.items():
            track = build_round(key, spec)
            actual = len(track) / SR
            assert abs(actual - spec["roundSeconds"]) < 0.01, (
                f"{level}/{key}: track {actual}s but roundSeconds is {spec['roundSeconds']}s"
            )
            write_mp3(track, OUT_NAMES[key], gain=VOICES[key]["gain"], level=level)
        write_mp3(completion_chime(), "completion_chime", gain=0.80, level=level)
