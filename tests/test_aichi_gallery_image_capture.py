"""Conservative origin and payload gate for public image audit."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("gallery_capture", Path(__file__).resolve().parents[1] / "scripts" / "aichi_gallery_image_capture.py")
assert SPEC and SPEC.loader
capture = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(capture)


class CaptureTests(unittest.TestCase):
    def test_exact_public_image_host_and_png_path(self):
        capture.validate_image_url("https://assets.st-note.com/img/123-name.png?width=1200")
        for url in ("http://assets.st-note.com/img/a.png", "https://evil.example/img/a.png",
                    "https://assets.st-note.com.evil.example/img/a.png", "https://assets.st-note.com/item/a.png",
                    "https://assets.st-note.com/img/a.gif"):
            with self.subTest(url=url), self.assertRaises(ValueError):
                capture.validate_image_url(url)


if __name__ == "__main__":
    unittest.main()
