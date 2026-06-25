#!/usr/bin/env python3
"""Copy promo images into public/media/readme/ with stable filenames."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public" / "media" / "readme"

# Drop your generated art into a folder, then run:
#   python scripts/import-readme-media.py path/to/folder
NAMES = {
    "overview": "hero-overview.png",
    "conference": "hero-conference.png",
    "enterprise": "hero-enterprise.png",
    "platform": "hero-platform.png",
    "productivity-dna": "hero-productivity-dna.png",
    "features": "hero-features.png",
}


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/import-readme-media.py <source-folder>")
        print("Expected files (any one match per row):")
        for key, dest in NAMES.items():
            print(f"  *{key}*  ->  {dest}")
        sys.exit(1)

    src_dir = Path(sys.argv[1])
    if not src_dir.is_dir():
        print(f"Not a directory: {src_dir}")
        sys.exit(1)

    DEST.mkdir(parents=True, exist_ok=True)
    copied = 0
    for path in sorted(src_dir.iterdir()):
        if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        lower = path.name.lower()
        for key, dest_name in NAMES.items():
            if key.replace("-", "") in lower.replace("-", "").replace("_", "") or key in lower:
                shutil.copy2(path, DEST / dest_name)
                print(f"  {path.name} -> {dest_name}")
                copied += 1
                break

    if copied == 0:
        # fallback: copy up to 6 images in sorted order
        images = sorted(
            p for p in src_dir.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
        )[:6]
        for path, dest_name in zip(images, NAMES.values()):
            shutil.copy2(path, DEST / dest_name)
            print(f"  {path.name} -> {dest_name}")
            copied += 1

    print(f"Done — {copied} file(s) in {DEST}")


if __name__ == "__main__":
    main()
