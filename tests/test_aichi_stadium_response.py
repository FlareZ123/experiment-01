"""Exact opening/Prize/turn-draw Stadium path regressions."""
import json
import unittest
from pathlib import Path

from scripts.aichi_stadium_response import access_probabilities, report_published_field


class StadiumAccessTests(unittest.TestCase):
    def test_zero_connectors_is_direct_stadium_only(self):
        report = access_probabilities(4, supporters=0, items=0)
        self.assertAlmostEqual(
            report["stadium_access_if_supporter_allowed"],
            report["stadium_in_hand_after_turn_draw"], places=12)

    def test_source_counts_and_prize_aware_rates(self):
        path = Path(__file__).resolve().parents[1] / "results/aichi-2026/full-decklists.json"
        report = report_published_field(json.loads(path.read_text("utf-8")))
        rows = report["opponent_decks"]
        self.assertEqual([r["rank"] for r in rows], [6, 24, 29])
        self.assertEqual([r["stadium_copies"] for r in rows], [4, 4, 5])
        self.assertAlmostEqual(rows[0]["stadium_in_valid_starting_hand"], 0.36396950356706, places=9)
        self.assertAlmostEqual(rows[0]["stadium_in_hand_after_turn_draw"], 0.41197180518467, places=9)
        self.assertAlmostEqual(rows[0]["stadium_access_if_supporter_allowed"], 0.66767389634233, places=9)
        self.assertAlmostEqual(rows[2]["stadium_access_if_supporter_allowed"], 0.71432396428625, places=9)

    def test_channels_partition_probability(self):
        for stadiums in (4, 5):
            r = access_probabilities(stadiums)
            subtotal = sum(r[k] for k in (
                "stadium_in_hand_after_turn_draw",
                "guzma_hala_route_after_draw",
                "tag_call_route_after_draw",
                "no_modelled_stadium_access",
            ))
            self.assertAlmostEqual(subtotal, 1.0, places=10)


if __name__ == "__main__":
    unittest.main()
