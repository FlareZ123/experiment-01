"""Pure exact fractions for early Garbotoxin Tool-removal resource access."""
import sys
import unittest
import json
from fractions import Fraction
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from rank11_garbotoxin_field_blower_response import DECKS, EVENTS, exact_response_rates


class GarbotoxinResponseTest(unittest.TestCase):
    def test_frozen_decks_match_actual_published_manifests(self):
        root = Path(__file__).resolve().parents[1] / "results/aichi-2026"
        field = json.loads((root / "full-decklists.json").read_text(encoding="utf-8"))
        champion = next(x["cards"] for x in field["decks"] if x["rank"] == 1)
        hood = json.loads(
            (root / "candidate-hood-shadow-rider.json").read_text(encoding="utf-8")
        )["cards"]
        for rows, expected in (
            (champion, DECKS["source_champion_rank1"]),
            (hood, DECKS["hood_shield_v1"]),
        ):
            by_name = {r["name"]: r["count"] for r in rows}
            self.assertEqual(sum(r["count"] for r in rows), 60)
            self.assertEqual(
                sum(r["count"] for r in rows
                    if r["category"] == "Pokémon" and
                    r["name"] != "Shadow Rider Calyrex VMAX"), expected[0],
            )
            self.assertEqual(by_name.get("Arven", 0), expected[1])
            self.assertEqual(by_name["Field Blower"], expected[2])
            self.assertEqual(by_name.get("Stealthy Hood", 0), expected[3])

    def test_immutable_source_categories(self):
        self.assertEqual(DECKS["source_champion_rank1"], (14, 0, 1, 0, 45))
        self.assertEqual(DECKS["hood_shield_v1"], (14, 1, 1, 2, 42))
        self.assertEqual(set(EVENTS), set(exact_response_rates(DECKS["hood_shield_v1"])))

    def test_direct_blower_invariant_between_source_lists(self):
        champion = exact_response_rates(DECKS["source_champion_rank1"])
        hood = exact_response_rates(DECKS["hood_shield_v1"])
        expected = Fraction(8530787, 66788480)
        self.assertEqual(champion["direct_field_blower"], expected)
        self.assertEqual(hood["direct_field_blower"], expected)
        self.assertEqual(champion["additional_arven_to_unprized_field_blower"], 0)

    def test_arven_recovery_exact(self):
        p = exact_response_rates(DECKS["hood_shield_v1"])
        self.assertEqual(
            p["additional_arven_to_unprized_field_blower"],
            Fraction(13403273, 133576960),
        )
        self.assertEqual(p["union_field_blower_or_arven"], Fraction(30464847, 133576960))
        self.assertGreater(p["union_field_blower_or_arven"], p["direct_field_blower"])

    def test_arven_multiaxis_exact_and_subset(self):
        p = exact_response_rates(DECKS["hood_shield_v1"])
        self.assertEqual(
            p["arven_with_field_blower_and_hood_resources"],
            Fraction(28372022819, 249788915200),
        )
        self.assertGreater(p["arven_with_field_blower_and_hood_resources"], 0)
        self.assertLessEqual(
            p["arven_with_field_blower_and_hood_resources"],
            p["union_field_blower_or_arven"],
        )


if __name__ == "__main__":
    unittest.main()
