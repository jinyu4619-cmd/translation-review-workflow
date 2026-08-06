#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from PIL import Image

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
OVERVIEW_KEYWORDS = ("总览", "总表", "概览", "预览", "overview", "ledger", "台账", "汇总")


def natural_key(value: str) -> list[object]:
    parts = re.split(r"(\d+)", value.lower())
    result: list[object] = []
    for part in parts:
        if part.isdigit():
            result.append(int(part))
        else:
            result.append(part)
    return result


def image_size(image_path: Path) -> tuple[int | None, int | None]:
    try:
        with Image.open(image_path) as image:
            return image.width, image.height
    except Exception:
        return None, None


def classify_role(file_path: Path, width: int | None, height: int | None) -> str:
    name = file_path.stem.lower()
    if any(keyword in name for keyword in OVERVIEW_KEYWORDS):
        return "overview_candidate"
    return "template_candidate"


def collect_images(folder: Path) -> list[dict[str, object]]:
    files = [
        path
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    ]
    files.sort(key=lambda path: natural_key(path.name))

    results: list[dict[str, object]] = []
    for index, file_path in enumerate(files, start=1):
        width, height = image_size(file_path)
        role = classify_role(file_path, width, height)
        results.append(
            {
                "index": index,
                "filename": file_path.name,
                "path": str(file_path.resolve()),
                "stem": file_path.stem,
                "extension": file_path.suffix.lower(),
                "width": width,
                "height": height,
                "probable_role": role,
            }
        )
    return results


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scan a review folder and list overview candidates and template images."
    )
    parser.add_argument("folder", help="Folder that contains review images and overview images.")
    parser.add_argument(
        "--write-json",
        help="Optional path to save the JSON result. If omitted, print to stdout.",
    )
    args = parser.parse_args()

    folder = Path(args.folder).expanduser().resolve()
    if not folder.exists() or not folder.is_dir():
        raise SystemExit(f"Folder not found or not a directory: {folder}")

    images = collect_images(folder)
    overview_candidates = [image for image in images if image["probable_role"] == "overview_candidate"]
    template_candidates = [image for image in images if image["probable_role"] == "template_candidate"]

    payload = {
        "folder": str(folder),
        "image_count": len(images),
        "overview_candidate_count": len(overview_candidates),
        "template_candidate_count": len(template_candidates),
        "overview_candidates": overview_candidates,
        "template_candidates": template_candidates,
        "all_images": images,
        "notes": [
            "Inspect overview_candidate images first.",
            "Only review templates that are clearly accepted in the overview image and still marked 未审核.",
            "Use file order and image content together when pairing Chinese and target-language images.",
        ],
    }

    serialized = json.dumps(payload, ensure_ascii=False, indent=2)
    if args.write_json:
        output_path = Path(args.write_json).expanduser().resolve()
        output_path.write_text(serialized, encoding="utf-8")
    else:
        print(serialized)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
