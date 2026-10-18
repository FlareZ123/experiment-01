"""Pure exact-arithmetic regression for rank-11 Oranguru lock opportunities."""
import sys
import unittest
from fractions import Fraction
from math import comb
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from rank11_oranguru_tool_lock_exact import (
    COUNTS, exact_rates, favorable_prize_count, compositions,
    prize_count_for_route,
)


class Rank11OranguruExactTests(unittest.TestCase):
    def test_source_partition(self):
        self.assertEqual(sum(COUNTS), 60)
        self.assertEqual(COUNTS[:7], (2, 2, 3, 2, 4, 2, 2))
        self.assertEqual(sum(1 for _ in compositions()), 6274)

    def test_inclusion_exclusion_one_required_group(self):
        rem = [0] * 9
        rem[6] = 2
        self.assertEqual(
            favorable_prize_count(rem, {6}),
            comb(52, 6) - comb(50, 4),
        )

    def test_inclusion_exclusion_two_required_groups(self):
        rem = [0] * 9
        rem[1] = rem[6] = 2
        self.assertEqual(
            favorable_prize_count(rem, {1, 6}),
            comb(52, 6) - 2 * comb(50, 4) + comb(48, 2),
        )

    def test_route_requires_oranguru_and_searchable_garbodor(self):
        self.assertEqual(prize_count_for_route((0, 1, 1, 1, 0, 1, 0, 0, 5)), 0)
        self.assertEqual(prize_count_for_route((1, 1, 1, 1, 0, 1, 2, 0, 1)), 0)

    def test_exact_conditional_probabilities(self):
        rates = exact_rates()
        self.assertEqual(
            rates["full_restricted_route"],
            Fraction(11895095504671537, 81007751255471040),
        )
        self.assertEqual(
            rates["trubbish_directly_seen"],
            Fraction(209724224821603, 3447138351296640),
        )
        self.assertEqual(
            rates["boost_shake_directly_seen"],
            Fraction(2513701770361183, 81007751255471040),
        )
        self.assertEqual(
            rates["trubbish_float_boost_directly_seen"],
            Fraction(251244295, 79942911672),
        )

    def test_nested_event_boundaries(self):
        p = exact_rates()
        self.assertGreater(p["full_restricted_route"], p["trubbish_directly_seen"])
        self.assertGreater(p["full_restricted_route"], p["boost_shake_directly_seen"])
        self.assertGreater(p["boost_shake_directly_seen"], p["trubbish_float_boost_directly_seen"])


if __name__ == "__main__":
    unittest.main()
