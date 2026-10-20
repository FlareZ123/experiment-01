"""Fetch only the 11 verified unassigned Aichi gallery images for visual source audit."""
from __future__ import annotations

import hashlib
import json
import os
import tempfile
from pathlib import Path
from urllib.parse import urlsplit

import requests
from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "results/aichi-2026/gallery-provenance-probe.json"
OUT = ROOT / "results/aichi-2026/gallery-images"
ALLOWED_GROUPS = {"Regidrago": "dragon", "Raichu Electrode Combo": "raichu"}
MAX_BYTES = 3_000_000


def validate_image_url(url: str) -> None:
    parsed = urlsplit(url)
    if (parsed.scheme != "https" or parsed.hostname != "assets.st-note.com"
            or not parsed.path.startswith("/img/") or not parsed.path.endswith(".png")):
        raise ValueError(f"Unexpected image origin/path: {url}")


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(mode="wb", dir=path.parent, delete=False) as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
            temp_path = handle.name
        os.replace(temp_path, path)


def run() -> dict:
    manifest = json.loads(SOURCE.read_text(encoding="utf-8"))
    if manifest["status"] != "unassigned-gallery-image-leads-only" or not manifest["top32_heading_found"]:
        raise ValueError("Gallery source not validated")
    groups = manifest["images_by_unassigned_archetype"]
    if set(groups) != set(ALLOWED_GROUPS):
        raise ValueError("Unexpected archetype groups")
    records: list[dict] = []
    for group, prefix in ALLOWED_GROUPS.items():
        for index, source in enumerate(groups[group], 1):
            url = source["url"]
            validate_image_url(url)
            response = requests.get(url, timeout=20)
            response.raise_for_status()
            content = response.content
            if not (content.startswith(b"\x89PNG\r\n\x1a\n") and 0 < len(content) <= MAX_BYTES):
                raise ValueError(f"Unexpected PNG payload: {url}, {len(content)} bytes")
            path = OUT / f"{prefix}-{index:02d}.png"
            atomic_write(path, content)
            records.append({"group": group, "url": url, "path": str(path.relative_to(ROOT)),
                            "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()})
    report = {"status": "unassigned-image-capture-only", "source_page_sha256": manifest["html_sha256"],
              "images": records, "warning": "Visual image similarity does not establish a player's registered 60."}
    atomic_write(OUT / "capture-manifest.json", (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode())
    print(json.dumps({"captured": len(records), "groups": {k: len(v) for k, v in groups.items()},
                      "source_page_sha256": manifest["html_sha256"]}, ensure_ascii=False))
    return report


if __name__ == "__main__":
    run()
