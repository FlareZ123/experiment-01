"""Numerical and source-list tests for the turn-two Lillie search opportunity."""
import json
import random
import sys
import unittest
from fractions import Fraction
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from agent7_lillie_route_access import apparent_lillie_route


class LillieOpportunityTests(unittest.TestCase):
    def test_five_required_category_count_matches_frozen_60(self):
        cards = json.loads(
            (ROOT / "results" / "als" / "agent7-tinkaton-lillie-reset-v1.json")
            .read_text(encoding="utf-8")
        )["cards"]
        counts = {c["id"]: c["count"] for c in cards}
        self.assertEqual(counts["sv2-102"], 4)
        self.assertEqual(counts["sv5-144"], 4)
        self.assertEqual(counts["svp-31"] + counts["swsh1-163"], 7)
        self.assertEqual(counts["sv1-191"], 4)
        self.assertEqual(counts["sm1-136"] + counts["swsh9-151"], 6)
        self.assertEqual(counts["me1-119"], 2)

    def test_exact_fraction_and_lillie_copy_sensitivity(self):
        self.assertEqual(
            apparent_lillie_route(), Fraction(2287868359, 133048283940)
        )
        self.assertEqual(
            apparent_lillie_route(lillie_copies=4),
            Fraction(78002981, 2463857110)
        )
        self.assertLess(apparent_lillie_route(1), apparent_lillie_route(2))
        self.assertLess(apparent_lillie_route(2), apparent_lillie_route(3))
        self.assertLess(apparent_lillie_route(3), apparent_lillie_route(4))

    def test_independent_seeded_physical_nine_card_sample(self):
        # Disjoint deck partitions:
        # 0..3 Tinkatink; 4..7 Poffin; 8..14 ex/Incense;
        # 15..18 Candy; 19..24 Double Energy; 25..26 Lillie;
        # 27..33 other Basic Pokémon, and 34..59 unclassified.
        randomizer = random.Random(20261030)
        attempts = 150000
        success = 0
        for _ in range(attempts):
            nine = randomizer.sample(range(60), 9)
            valid = any(x < 4 or 27 <= x < 34 for x in nine[:7])
            setup = any(x < 8 for x in nine[:8])
            ex = any(8 <= x < 15 for x in nine)
            candy = any(15 <= x < 19 for x in nine)
            energy = any(19 <= x < 25 for x in nine)
            lillie = any(25 <= x < 27 for x in nine)
            success += valid and setup and ex and candy and energy and lillie
        self.assertLess(
            abs(success / attempts - float(apparent_lillie_route())),
            0.0015
        )


if __name__ == "__main__":
    unittest.main()
