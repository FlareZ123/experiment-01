"""Probe unmodified and width-limited public rank-28 image assets, without assigning an entrant."""
from __future__ import annotations

import hashlib
import json
import os
import struct
import tempfile
from pathlib import Path
from urllib.parse import urlsplit

import requests
from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "results/aichi-2026/rank28-image-variants"
BASE_URL = "https://assets.st-note.com/img/1778498104-f3i2b7OUhxcapD08QlB9ywrH.png"
EXPECTED_1200_SHA256 = "3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9"
MAX_BYTES = 12_000_000
VARIANTS = {
    "1200": BASE_URL + "?width=1200",
    "2400": BASE_URL + "?width=2400",
    "original": BASE_URL,
}


def validate_url(url: str) -> None:
    parsed = urlsplit(url)
    if (parsed.scheme != "https" or parsed.netloc != "assets.st-note.com"
            or parsed.path != urlsplit(BASE_URL).path
            or parsed.query not in {"", "width=1200", "width=2400"}
            or parsed.fragment):
        raise ValueError(f"Unapproved rank-28 image URL: {url}")


def png_dimensions(data: bytes) -> tuple[int, int]:
    if (len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n"
            or data[12:16] != b"IHDR"):
        raise ValueError("The image is not an ordinary PNG with an IHDR header")
    width, height = struct.unpack(">II", data[16:24])
    if not 0 < width <= 10000 or not 0 < height <= 10000:
        raise ValueError(f"Implausible image dimensions: {width}x{height}")
    return width, height


def atomic_write(path: Path, contents: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(mode="wb", dir=path.parent, delete=False) as handle:
            try:
                handle.write(contents)
                handle.flush()
                os.fsync(handle.fileno())
                temp_path = Path(handle.name)
            except BaseException:
                Path(handle.name).unlink(missing_ok=True)
                raise
        os.replace(temp_path, path)


def fetch_variant(url: str, session: requests.Session) -> tuple[bytes, tuple[int, int]]:
    validate_url(url)
    with session.get(url, timeout=30, stream=True,
                     headers={"User-Agent": "Aichi-public-rank28-image-audit/1.0"}) as response:
        response.raise_for_status()
        validate_url(response.url)
        chunks = []
        size = 0
        for chunk in response.iter_content(chunk_size=65536):
            size += len(chunk)
            if size > MAX_BYTES:
                raise ValueError(f"Rank-28 PNG exceeds {MAX_BYTES} bytes")
            chunks.append(chunk)
    data = b"".join(chunks)
    return data, png_dimensions(data)


def decode_qr(data: bytes) -> list[str]:
    """Read-only optional check for a public QR payload, without inferring registration."""
    import cv2
    import numpy as np

    image = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("OpenCV could not decode the validated PNG")
    detector = cv2.QRCodeDetector()
    values = set()
    for scale in (1, 2):
        candidate = image if scale == 1 else cv2.resize(
            image, None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST)
        payload, _, _ = detector.detectAndDecode(candidate)
        if payload:
            values.add(payload[:1024])
    return sorted(values)


def run(*, scan_qr: bool = True, session: requests.Session | None = None) -> dict:
    session = session or requests.Session()
    records = []
    seen = {}
    baseline_ok = False
    for label, url in VARIANTS.items():
        try:
            content, (width, height) = fetch_variant(url, session)
            digest = hashlib.sha256(content).hexdigest()
            if label == "1200":
                baseline_ok = digest == EXPECTED_1200_SHA256
            record = {
                "variant": label, "url": url, "bytes": len(content),
                "width": width, "height": height, "sha256": digest,
                "duplicate_of": seen.get(digest),
                "qr_payloads": decode_qr(content) if scan_qr else [],
            }
            if digest not in seen:
                atomic_write(OUT / f"rank28-{label}.png", content)
                seen[digest] = label
            records.append(record)
        except (requests.RequestException, ValueError) as error:
            records.append({"variant": label, "url": url,
                            "error": f"{type(error).__name__}: {error}"})
    result = {
        "status": "source-1200-match" if baseline_ok else "source-1200-unverified",
        "source": "https://note.com/nayuta_poke/n/n7e3d0552090b",
        "source_1200_sha256_expected": EXPECTED_1200_SHA256,
        "original_60_registration_verified": False,
        "civil_identity_bridge_verified": False,
        "japanese_printing_ids_verified": False,
        "records": records,
    }
    atomic_write(OUT / "manifest.json",
                 (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(json.dumps(result, ensure_ascii=False))
    return result


if __name__ == "__main__":
    run()
