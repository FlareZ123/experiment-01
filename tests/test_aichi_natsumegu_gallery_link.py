"""Offline evidence-integrity tests for Natsumegu photographed deck-grid relation."""
from __future__ import annotations

import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import cv2
import numpy as np

from scripts import aichi_natsumegu_gallery_link as source


class NatsumeguGalleryTest(unittest.TestCase):
    def test_manual_visible_badges_total_60(self):
        counts = source.validate_badge_rows(source.BADGE_ROWS)
        self.assertEqual(counts["row_subtotals"], [14, 18, 12, 16])
        self.assertEqual(counts["card_cells"], 38)
        self.assertEqual(counts["card_total"], 60)

    def test_quantity_cannot_be_silently_changed(self):
        changed = [row.copy() for row in source.BADGE_ROWS]
        changed[2][0] = 2
        with self.assertRaisesRegex(ValueError, "quantity transcription"):
            source.validate_badge_rows(changed)
        changed[2][0] = 0
        with self.assertRaisesRegex(ValueError, "quantity"):
            source.validate_badge_rows(changed)

    def test_fails_closed_on_changed_image_or_wrong_geometry(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            encoded_ok, payload = cv2.imencode(".png", np.zeros((12, 16, 3), np.uint8))
            self.assertTrue(encoded_ok)
            data = payload.tobytes()
            fixture = ("picture.png", hashlib.sha256(data).hexdigest(), (16, 12))
            (directory / fixture[0]).write_bytes(data)
            with patch.dict(source.SOURCES, {"post": fixture}):
                observed = source.validated_image("post", directory)
                self.assertEqual(observed.shape[:2], (12, 16))
                (directory / fixture[0]).write_bytes(data + b"junk")
                with self.assertRaisesRegex(ValueError, "hash mismatch"):
                    source.validated_image("post", directory)
            (directory / fixture[0]).write_bytes(data)
            with patch.dict(source.SOURCES, {"post": (fixture[0], fixture[1], (12, 16))}):
                with self.assertRaisesRegex(ValueError, "geometry mismatch"):
                    source.validated_image("post", directory)

    def test_grid_comparison_rejects_wrong_dimensions(self):
        with self.assertRaisesRegex(ValueError, "geometry"):
            source.related_grid(np.zeros((12, 16, 3), np.uint8),
                                np.zeros((512, 1024, 3), np.uint8))


if __name__ == "__main__":
    unittest.main()
