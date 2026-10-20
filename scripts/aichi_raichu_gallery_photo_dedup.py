"""Verify that the two public Raichu gallery images reuse one photograph.

Input is Agent3's original public, provenance-hashed gallery capture ZIP,
not a synthetic image and not evidence of the participant's civil identity.
Requires opencv-python and numpy. No files are created or changed.
"""

import argparse
import hashlib
import json
import zipfile

import cv2
import numpy as np


EXPECTED = {
    "raichu-01.png": "a840c10fef6fc55813311ee03fa275fc6bc6b829da0315e7393fe11c5accae98",
    "raichu-02.png": "c6a4234c02d7ce0e55dcea5e7cdd47eeaf2bdb8b7951afaccbfa6fd55ee39d00",
}


def audit(archive_path):
    with zipfile.ZipFile(archive_path) as archive:
        images = {}
        for name, expected in EXPECTED.items():
            raw = archive.read(name)
            actual = hashlib.sha256(raw).hexdigest()
            if actual != expected:
                raise ValueError(f"{name}: original image checksum mismatch")
            image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8),
                                 cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError(f"{name}: image decode failed")
            images[name] = image

    embedded, standalone = images.values()
    if embedded.shape != (1210, 937, 3) or standalone.shape != (477, 900, 3):
        raise ValueError("Archived gallery image dimensions changed")

    # 01 includes the photo in its bottom-left, with adjacent match history.
    screenshot_photo = embedded[688:1205, 15:472]
    to_gray = lambda img: cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    orb = cv2.ORB_create(nfeatures=3000)
    left, left_des = orb.detectAndCompute(to_gray(screenshot_photo), None)
    right, right_des = orb.detectAndCompute(to_gray(standalone), None)
    if left_des is None or right_des is None:
        raise ValueError("Missing ORB descriptors")
    pairs = cv2.BFMatcher(cv2.NORM_HAMMING).knnMatch(left_des, right_des, k=2)
    accepted = [a for a, b in pairs if a.distance < 0.75 * b.distance]
    if len(accepted) < 4:
        raise ValueError("Insufficient matched features for homography")

    source = np.float32([left[m.queryIdx].pt for m in accepted]).reshape(-1, 1, 2)
    target = np.float32([right[m.trainIdx].pt for m in accepted]).reshape(-1, 1, 2)
    cv2.setRNGSeed(20261020)
    matrix, inliers = cv2.findHomography(source, target, cv2.RANSAC, 4.0)
    count = int(inliers.sum()) if inliers is not None else 0
    return {
        "study": "raichu-public-gallery-duplicate-photo-v1",
        "original_sha256": EXPECTED,
        "opencv": cv2.__version__,
        "orb_nfeatures": 3000,
        "ratio_threshold": 0.75,
        "ransac_px_threshold": 4.0,
        "screenshot_crop_xyxy": [15, 688, 472, 1205],
        "accepted_feature_matches": len(accepted),
        "homography_inliers": count,
        "inlier_fraction": count / len(accepted),
        "same_underlying_photo_supported": bool(
            matrix is not None and count >= 100 and count / len(accepted) >= 0.6
        ),
        "source_identity_verified": False,
        "rank25_registered_list_verified": False,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", help="original aichi-gallery-media.zip")
    args = parser.parse_args()
    print(json.dumps(audit(args.archive), indent=2))
