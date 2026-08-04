#!/usr/bin/env python3
"""
export_captions.py — Convert AssemblyAI transcript to Remotion-ready caption format.

Usage:
  python tools/export_captions.py videos/video-1
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python tools/export_captions.py <project_folder>")

    project_dir = ROOT / sys.argv[1]
    trans_file = project_dir / "work" / "transcripts" / "clip1.json"
    if not trans_file.exists():
        # check any json in transcripts
        tdir = project_dir / "work" / "transcripts"
        files = list(tdir.glob("*.json")) if tdir.exists() else []
        if files:
            trans_file = files[0]
        else:
            sys.exit("No transcript json found!")

    data = json.loads(trans_file.read_text(encoding="utf-8"))
    raw_words = data.get("words", [])

    words = []
    for w in raw_words:
        words.append({
            "text": w["text"],
            "start": round(w["start"] / 1000.0, 3), # seconds
            "end": round(w["end"] / 1000.0, 3)
        })

    out_file = ROOT / "remotion" / "src" / "captions.json"
    out_file.write_text(json.dumps(words, indent=2), encoding="utf-8")
    print(f"Exported {len(words)} words to {out_file.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
