"""Independent source-manifest and exact-fraction checks for Stone + Arven response."""
import json
import sys
import unittest
from fractions import Fraction
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from rank11_field_blower_arven_stone_union import SOURCE_COUNTS, exact_rates


class Rank11FieldBlowerArvenStoneUnionTests(unittest.TestCase):
    def test_immutable_full_60_sources(self):
        root = Path(__file__).resolve().parents[1] / "results/aichi-2026"
        field = json.loads((root / "full-decklists.json").read_text(encoding="utf-8"))
        champion = next(x["cards"] for x in field["decks"] if x["rank"] == 1)
        hood = json.loads(
            (root / "candidate-hood-shadow-rider.json").read_text(encoding="utf-8")
        )["cards"]
        for rows, expect in (
            (champion, SOURCE_COUNTS["source_champion_rank1"]),
            (hood, SOURCE_COUNTS["hood_shield_v1"]),
        ):
            by_name = {x["name"]: x["count"] for x in rows}
            self.assertEqual(sum(x["count"] for x in rows), 60)
            self.assertEqual(by_name["Shadow Rider Calyrex V"], expect[0])
            self.assertEqual(sum(
                x["count"] for x in rows
                if x["category"] == "Pokémon"
                and x["name"] not in ("Shadow Rider Calyrex V", "Shadow Rider Calyrex VMAX")
            ), expect[1])
            self.assertEqual(
                tuple(by_name.get(x, 0) for x in (
                    "Field Blower", "Arven", "Forest Seal Stone", "Stealthy Hood"
                )), expect[2:6])

    def test_exact_champion_matches_independent_js(self):
        rates = exact_rates(SOURCE_COUNTS["source_champion_rank1"])
        self.assertEqual(rates["direct_blower"], Fraction(8530787, 66788480))
        self.assertEqual(rates["additional_arven"], 0)
        self.assertEqual(rates["additional_stone"], Fraction(10197119, 267153920))
        self.assertEqual(rates["union"], Fraction(44320267, 267153920))

    def test_exact_hood_disjoint_union(self):
        p = exact_rates(SOURCE_COUNTS["hood_shield_v1"])
        self.assertEqual(p["direct_blower"], Fraction(8530787, 66788480))
        self.assertEqual(p["additional_arven"], Fraction(13403273, 133576960))
        self.assertEqual(p["additional_stone"], Fraction(189651859, 4408039680))
        self.assertEqual(p["union"], Fraction(119499181, 440803968))
        self.assertEqual(p["union"], sum(
            p[key] for key in ("direct_blower", "additional_arven", "additional_stone")
        ))

    def test_hood_advantage_does_not_prove_competitive_game(self):
        hood = exact_rates(SOURCE_COUNTS["hood_shield_v1"])
        champion = exact_rates(SOURCE_COUNTS["source_champion_rank1"])
        self.assertGreater(hood["union"], champion["union"])
        self.assertLess(hood["union"], Fraction(1))


if __name__ == "__main__":
    unittest.main()
