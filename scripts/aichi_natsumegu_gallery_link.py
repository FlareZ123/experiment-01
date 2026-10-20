"""Verify one unassigned May 2026 Aichi Regidrago post-to-grid image match.

The grid is not accepted as any named entrant's tournament registration.
"""
from __future__ import annotations

import hashlib
import json
import os
import tempfile
from pathlib import Path

import cv2
import numpy as np
from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "results/aichi-2026/gallery-images"
REPORT = ROOT / "results/aichi-2026/natsumegu-visual60-gallery-relation.json"

SOURCES = {
    "post": ("dragon-03.png",
             "f7c34984cf858554612819cf56ee4e60c44307da101d60ce0022e3e50dd8e7cf",
             (1055, 1541)),
    "grid": ("dragon-04.png",
             "bbfc196a6297d515692cc00ed4530541e3eb3be7c0afb4bd459dfa585fb650f7",
             (1024, 512)),
}
BADGE_ROWS = [
    [3, 3, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 3, 4, 4],
    [1, 1, 1, 1, 1, 1, 2, 1, 2, 1],
    [1, 2, 1, 1, 1, 4, 3, 3],
]


def validate_badge_rows(rows: list[list[int]]) -> dict:
    if [len(row) for row in rows] != [10, 10, 10, 8]:
        raise ValueError("Unexpected manual grid-cell partition")
    if any(type(n) is not int or not 1 <= n <= 4 for row in rows for n in row):
        raise ValueError("Invalid visual badge quantity")
    subtotals = [sum(row) for row in rows]
    if subtotals != [14, 18, 12, 16]:
        raise ValueError("Manual quantity transcription differs from audited image")
    return {"row_subtotals": subtotals, "card_cells": 38, "card_total": sum(subtotals)}


def validated_image(which: str, directory: Path) -> np.ndarray:
    filename, expected_sha, (width, height) = SOURCES[which]
    data = (directory / filename).read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != expected_sha:
        raise ValueError(f"{filename} archive hash mismatch {digest}")
    pixels = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
    if pixels is None or pixels.shape[:2] != (height, width):
        raise ValueError(f"{filename} source geometry mismatch")
    return pixels


def related_grid(post: np.ndarray, grid: np.ndarray) -> dict:
    """Independently match the post's inset to the standalone grid."""
    if post.shape[:2] != (1541, 1055) or grid.shape[:2] != (512, 1024):
        raise ValueError("Unexpected image geometry")
    inset = post[920:1487, 510:1030]
    orb = cv2.ORB_create(4000)
    key_a, features_a = orb.detectAndCompute(inset, None)
    key_b, features_b = orb.detectAndCompute(grid, None)
    if features_a is None or features_b is None:
        raise ValueError("Insufficient image descriptor features")
    raw = cv2.BFMatcher(cv2.NORM_HAMMING).knnMatch(features_a, features_b, k=2)
    good = [m for pair in raw if len(pair) == 2
            for m, other in [pair] if m.distance < 0.75 * other.distance]
    if len(good) < 100:
        raise ValueError(f"Insufficient independently matched grid features: {len(good)}")
    p1 = np.float32([key_a[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    p2 = np.float32([key_b[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    matrix, inliers = cv2.findHomography(p1, p2, cv2.RANSAC, 4)
    count = int(inliers.sum()) if inliers is not None else 0
    if matrix is None or count < 100 or count / len(good) < 0.80:
        raise ValueError(f"Inconsistent post-to-grid geometry: {count}/{len(good)}")
    return {
        "descriptor_matches": len(good),
        "homography_consistent_matches": count,
        "inlier_fraction": round(count / len(good), 6),
        "inset_crop_xyxy": [510, 920, 1030, 1487],
        "opencv_version": cv2.__version__,
        "scope": "Same pictured card grid in poster's screenshot; not official registration"
    }


def atomic_write(path: Path, contents: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(dir=path.parent, mode="wb", delete=False) as target:
            try:
                target.write(contents)
                target.flush()
                os.fsync(target.fileno())
                tmp = target.name
            except BaseException:
                Path(target.name).unlink(missing_ok=True)
                raise
        os.replace(tmp, path)


def run(directory: Path = IMAGE_DIRECTORY, report: Path = REPORT) -> dict:
    post = validated_image("post", directory)
    grid = validated_image("grid", directory)
    relationship = related_grid(post, grid)
    count = validate_badge_rows(BADGE_ROWS)
    result = {
        "study": "May 2026 Natsumegu social-post image and subsequent standalone card-grid",
        "source_article": "https://note.com/nayuta_poke/n/n7e3d0552090b",
        "source_social": "https://twitter.com/yamatodaisuki/status/2053387997710872929",
        "source_post_image": "https://assets.st-note.com/img/1778498012-7nHCUj3W6IZdGL94FhPs2u0e.png?width=1200",
        "source_grid_image": "https://assets.st-note.com/img/1778498023-e8KQGOJTRPIDjqX3Cwf6UY5H.png?width=1200",
        "source_sha256": {name: source[1] for name, source in SOURCES.items()},
        "self_reported_qualifier_place": 16,
        "self_reported_result": "Lost first Top32 elimination round",
        "badge_counts": BADGE_ROWS,
        "manual_counts": count,
        "same_grid_visual_geometry": relationship,
        "named_participant_attribution_verified": False,
        "source_rank23_registration_verified": False,
        "all_card_name_printing_transcription_verified": False,
        "admit_into_exact_top32_manifest": False,
        "warning": ("Swiss place 16 cannot be presumed identical to published final "
                    "placement, and social nickname is not tied to official rank23 Yuki Ueno.")
    }
    atomic_write(report, (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode())
    print(json.dumps(result, ensure_ascii=False))
    return result


if __name__ == "__main__":
    run()
