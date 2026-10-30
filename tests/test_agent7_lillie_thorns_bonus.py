"""Exact mulligan-race overlay on fixed Tinkaton/Lillie route card locations."""
import sys
import unittest
from fractions import Fraction
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from agent7_lillie_route_access import apparent_lillie_route
from agent7_lillie_thorns_bonus import route_given_bonus, thorns_bonus_bounds


class TinkatonThornsBonusTests(unittest.TestCase):
    def test_bonus_zero_matches_independent_existing_event(self):
        from math import comb
        valid = 1 - Fraction(comb(49, 7), comb(60, 7))
        self.assertEqual(route_given_bonus(0), apparent_lillie_route() / valid)

    def test_exact_validity_and_mulligan_race(self):
        d = thorns_bonus_bounds(30)
        self.assertAlmostEqual(float(d["candidate_valid"]), 0.7775788585041408)
        self.assertAlmostEqual(float(d["thorns_valid"]), 0.3994996257446656)
        self.assertAlmostEqual(float(d["bonus_probability"]), 0.5389161854673047)
        self.assertLess(d["no_bonus"], d["lower"])
        self.assertLess(d["lower"], d["upper"])
        self.assertLess(float(d["unresolved_tail"]), 1.3e-7)
        self.assertLess(abs(float(d["lower"])-0.049464029605092455), 1e-12)

    def test_monotone_card_location_opportunities(self):
        probabilities=[route_given_bonus(m) for m in range(9)]
        self.assertTrue(all(a < b for a,b in zip(probabilities,probabilities[1:])))


if __name__ == "__main__":
    unittest.main()
