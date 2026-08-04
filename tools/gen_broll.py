#!/usr/bin/env python3
"""
gen_broll.py — Generate automated cinematic B-Roll for a video using Gemini Image.

Reads the edited transcript, splits it into 10-second thematic scenes, and generates
a stylized 16:9 image for each scene using Google's Nano Banana Pro.

Usage:
  python tools/gen_broll.py video-1
"""

import json
import os
import sys
import time
from pathlib import Path

# Try importing google genai SDK
try:
    from google import genai
    from google.genai import types
except ImportError:
    sys.exit("Please install google-genai SDK first: pip install google-genai")

ROOT = Path(__file__).resolve().parent.parent

def load_env_key(name: str) -> str:
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line.startswith(name + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get(name, "")

def load_transcript(project_dir: Path) -> list:
    # Try edited transcript first (final cut times)
    et_path = project_dir / "work" / "edited-transcript.json"
    if et_path.exists():
        return json.loads(et_path.read_text(encoding="utf-8"))
    
    # Fallback to raw transcripts if cut hasn't been made
    transcripts_dir = project_dir / "work" / "transcripts-u35"
    if not transcripts_dir.exists():
        transcripts_dir = project_dir / "work" / "transcripts"
    
    if transcripts_dir.exists():
        words = []
        for tpath in sorted(transcripts_dir.glob("*.json")):
            data = json.loads(tpath.read_text(encoding="utf-8"))
            # convert ms to seconds
            for w in data.get("words", []):
                words.append({
                    "text": w["text"],
                    "start": w["start"] / 1000.0,
                    "end": w["end"] / 1000.0
                })
        return words
    
    return []

def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python tools/gen_broll.py <project_folder>")
    
    project_dir = ROOT / sys.argv[1]
    broll_dir = ROOT / "media" / "projects" / sys.argv[1] / "broll"
    broll_dir.mkdir(parents=True, exist_ok=True)
    
    api_key = load_env_key("GEMINI_API_KEY")
    if not api_key:
        sys.exit("GEMINI_API_KEY not set in .env")

    words = load_transcript(project_dir)
    if not words:
        sys.exit("No transcript found! Please run transcribe.py or clean-cut first.")
    
    # Split into scenes of ~25 seconds
    scenes = []
    current_scene = {"start": words[0]["start"], "words": []}
    
    for w in words:
        current_scene["words"].append(w["text"])
        current_scene["end"] = w["end"]
        if w["end"] - current_scene["start"] >= 25.0:
            scenes.append(current_scene)
            current_scene = {"start": w["end"], "words": []}
            
    if current_scene["words"]:
        scenes.append(current_scene)
        
    print(f"Found {len(scenes)} scenes to generate.")
    
    client = genai.Client(api_key=api_key)
    manifest = []
    
    for i, scene in enumerate(scenes):
        scene_text = " ".join(scene["words"])
        print(f"\n--- Scene {i+1}/{len(scenes)} [{scene['start']:.1f} - {scene['end']:.1f}] ---")
        print(f"Text: {scene_text[:100]}...")
        
        prompt = (
            "A cinematic, 3D claymation style artwork for a YouTube video background. "
            "Beautiful lighting, abstract, conceptual. The artwork should represent the following concept: "
            f"'{scene_text}'"
        )
        
        out_path = broll_dir / f"scene_{i:03d}.png"
        
        if out_path.exists():
            print(f"Already exists: {out_path.name}")
        else:
            print("Generating image with Gemini...")
            max_retries = 3
            models_to_try = ["gemini-3.1-flash-image", "gemini-2.5-flash-image", "gemini-3-pro-image"]
            
            for attempts in range(max_retries):
                model_name = models_to_try[attempts % len(models_to_try)]
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents=[prompt],
                        config=types.GenerateContentConfig(
                            response_modalities=["IMAGE"],
                            image_config=types.ImageConfig(aspect_ratio="16:9", image_size="2K")
                        )
                    )
                    
                    img_bytes = None
                    for cand in (resp.candidates or []):
                        for part in ((cand.content.parts if cand.content else None) or []):
                            inline = getattr(part, "inline_data", None)
                            if inline and inline.data:
                                img_bytes = inline.data
                                break
                                
                    if img_bytes:
                        out_path.write_bytes(img_bytes)
                        print(f"Saved {out_path.name} (using {model_name})")
                        break
                    else:
                        print("Error: No image data returned.")
                        
                except Exception as e:
                    err_msg = str(e)
                    print(f"API Error ({model_name}): {err_msg[:120]}...")
                    if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                        print("Rate limit reached. Waiting 60 seconds before retrying...")
                        time.sleep(60)
                    else:
                        time.sleep(5)
                
            time.sleep(4) # rate limit protection
            
        manifest.append({
            "start": round(scene["start"], 3),
            "end": round(scene["end"], 3),
            "image": f"projects/{sys.argv[1]}/broll/scene_{i:03d}.png"
        })
        
    # Write manifest for Remotion
    manifest_path = ROOT / "remotion" / "src" / "broll_manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nWrote manifest to {manifest_path}")

if __name__ == "__main__":
    main()
