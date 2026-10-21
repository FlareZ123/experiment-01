"""Independent source-count regression and combinatorial ceiling tests."""
from __future__ import annotations

import json
import unittest
from collections import Counter

from scripts.aichi48_archie_initial_prize_ceiling import (
    MANIFEST,
    category_sizes,
    exact_prize_gate,
)


class MayAichi48SourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_original_author_photo_35_cell_and_four_rows(self) -> None:
        source = self.manifest
        self.assertEqual(
            source["source_image_sha256"],
            "8b3ca0d1084bce3c1de1473c99902580990c1350c0e10704412a54227c830f2d",
        )
        self.assertEqual(source["original_japanese_deck_code"],
                         "4xYGc4-dWhjRd-G8c8GD")
        self.assertEqual(source["source_image_pixel_dimensions"], [1024, 512])
        cells = source["visual_source_cells"]
        self.assertEqual(len(cells), 35)
        self.assertEqual(sum(c["count"] for c in cells), 60)
        self.assertEqual([
            sum(c["count"] for c in cells if c["row"] == row)
            for row in range(1, 5)
        ], [10, 16, 16, 18])
        observed = Counter({c["english"]: c["count"] for c in cells})
        self.assertEqual(
            observed, Counter({
                c["name"]: c["count"] for c in source["cards"]
            }),
        )
        self.assertEqual(
            source["counts"],
            {"total": 60, "distinct": 35, "Pokemon": 16,
             "Trainer": 35, "Energy": 9},
        )

    def test_january_to_may_six_changed_named_counts(self) -> None:
        january = json.loads(
            (MANIFEST.parents[1] / "als"
             / "agent2-archie-baxcalibur-umi2026-english-proxy-60.json")
            .read_text(encoding="utf-8")
        )
        previous = {
            c["name"]: c["count"] for c in january["cards"]
        }
        current = {
            c["name"]: c["count"] for c in self.manifest["cards"]
        }
        changed = {
            name: (
                previous.get(name, 0), current.get(name, 0)
            )
            for name in previous.keys() | current.keys()
            if previous.get(name, 0) != current.get(name, 0)
        }
        self.assertEqual(changed, {
            "Empoleon V": (1, 0),
            "Klefki": (0, 1),
            "Trainers' Mail": (3, 2),
            "Battle Compressor Team Flare Gear": (3, 2),
            "Telescopic Sight": (0, 1),
            "Team Rocket's Watchtower": (0, 1),
        })

    def test_six_prize_exact_finite_counts(self) -> None:
        self.assertEqual(
            category_sizes(self.manifest),
            (9, 1, 1, 1, 1, 2, 2, 43),
        )
        result = exact_prize_gate(category_sizes(self.manifest))
        self.assertEqual(result["total_six_prize_configurations"], 50063860)
        self.assertEqual(result["water_8_or_more_not_prized"]["count"], 39149990)
        self.assertEqual(result["without_any_prize_rescue"]["count"], 27083980)
        self.assertEqual(
            result["extra_one_prized_basic_rescuable_by_heavy_ball"]["count"],
            6186152,
        )
        self.assertEqual(
            result["with_one_heavy_ball_prize_swap"]["count"],
            33270132,
        )


if __name__ == "__main__":
    unittest.main()
