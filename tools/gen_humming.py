import urllib.request
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def main():
    env_file = ROOT / ".env"
    key = ""
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("ELEVENLABS_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
                
    if not key:
        key = os.environ.get("ELEVENLABS_API_KEY", "")

    if not key:
        print("Error: ELEVENLABS_API_KEY not found")
        return

    url = "https://api.elevenlabs.io/v1/sound-generation"
    req = urllib.request.Request(
        url,
        data=json.dumps({
            "text": "Deep, calming, resonant Om vocal humming drone with warm meditative resonance",
            "duration_seconds": 15.0,
            "prompt_influence": 0.5
        }).encode("utf-8"),
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json"
        }
    )

    out_file = ROOT / "media" / "library" / "music" / "clips" / "humming-drone.mp3"
    out_file.parent.mkdir(parents=True, exist_ok=True)
    
    print("Generating humming drone track via ElevenLabs...")
    with urllib.request.urlopen(req) as resp:
        out_file.write_bytes(resp.read())
    print(f"Saved {out_file.relative_to(ROOT)} successfully!")

if __name__ == "__main__":
    main()
