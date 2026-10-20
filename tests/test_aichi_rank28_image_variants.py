"""Offline deterministic tests for the rank-28 public-image variant probe."""
from __future__ import annotations

import hashlib
import struct
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts import aichi_rank28_image_variants as probe


def png(width: int, height: int, payload: bytes = b"x") -> bytes:
    return (b"\x89PNG\r\n\x1a\n" + b"\x00\x00\x00\x0dIHDR"
            + struct.pack(">II", width, height) + b"\x08\x06\x00\x00\x00"
            + payload)


class Response:
    def __init__(self, url: str, content: bytes):
        self.url = url
        self.content = content

    def __enter__(self):
        return self

    def __exit__(self, *unused):
        return False

    def raise_for_status(self):
        return None

    def iter_content(self, chunk_size: int):
        for pos in range(0, len(self.content), chunk_size):
            yield self.content[pos:pos + chunk_size]


class Session:
    def __init__(self, responses):
        self.responses = responses

    def get(self, url, **kwargs):
        return Response(url, self.responses[url])


class Rank28ImageVariantTest(unittest.TestCase):
    def test_rejects_different_origins_and_paths(self):
        for url in (
            "http://assets.st-note.com/img/1778498104-f3i2b7OUhxcapD08QlB9ywrH.png",
            "https://other.example/img/1778498104-f3i2b7OUhxcapD08QlB9ywrH.png",
            probe.BASE_URL + "?width=5000",
            probe.BASE_URL + "#fragment",
        ):
            with self.subTest(url=url), self.assertRaises(ValueError):
                probe.validate_url(url)
        for url in probe.VARIANTS.values():
            probe.validate_url(url)

    def test_png_dimensions_fail_closed(self):
        self.assertEqual(probe.png_dimensions(png(1200, 900)), (1200, 900))
        for payload in (b"", b"notpng", png(0, 900), png(1200, 10001)):
            with self.subTest(payload=payload[:24]), self.assertRaises(ValueError):
                probe.png_dimensions(payload)

    def test_duplicate_and_larger_original_are_recorded_without_promotion(self):
        small = png(1200, 1000)
        large = png(2400, 2000, b"z")
        responses = {
            probe.VARIANTS["1200"]: small,
            probe.VARIANTS["2400"]: large,
            probe.VARIANTS["original"]: large,
        }
        with tempfile.TemporaryDirectory() as directory, (
                patch.object(probe, "OUT", Path(directory))), (
                patch.object(probe, "EXPECTED_1200_SHA256",
                             hashlib.sha256(small).hexdigest())):
            result = probe.run(scan_qr=False, session=Session(responses))
            self.assertEqual(result["status"], "source-1200-match")
            self.assertFalse(result["original_60_registration_verified"])
            self.assertFalse(result["civil_identity_bridge_verified"])
            self.assertEqual(result["records"][2]["duplicate_of"], "2400")
            self.assertTrue((Path(directory) / "rank28-1200.png").exists())
            self.assertTrue((Path(directory) / "rank28-2400.png").exists())
            self.assertFalse((Path(directory) / "rank28-original.png").exists())
            self.assertTrue((Path(directory) / "manifest.json").exists())


if __name__ == "__main__":
    unittest.main()
