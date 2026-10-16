"""Exact finite and continuing alpha-spending regression checks."""
import unittest
from fractions import Fraction

from scripts.aichi_familywise_evidence import familywise_alpha, balanced_familywise_test
from scripts.matchup_evidence import SeatRecord


def flawless(games_per_cell):
    return [
        SeatRecord(rank, seat, games_per_cell, games_per_cell)
        for rank in range(1, 33)
        for seat in ("first", "second")
    ]


class FamilywiseEvidenceTests(unittest.TestCase):
    def test_first_allocations_are_exact_and_telescope(self):
        self.assertEqual(familywise_alpha(1), Fraction(1, 40))
        self.assertEqual(familywise_alpha(2), Fraction(1, 120))
        self.assertEqual(familywise_alpha(10), Fraction(1, 2200))
        first1000 = sum((familywise_alpha(i) for i in range(1, 1001)),
                        start=Fraction(0))
        self.assertEqual(first1000 + Fraction(1, 20 * 1001), Fraction(1, 20))

    def test_first_attempt_flawless_threshold(self):
        self.assertFalse(balanced_familywise_test(flawless(11), attempt_index=1)[
            "statistical_threshold_met"])
        x = balanced_familywise_test(flawless(12), attempt_index=1)
        self.assertEqual(x["games"], 768)
        self.assertTrue(x["statistical_threshold_met"])
        self.assertAlmostEqual(x["conservative_p_value"], 0.021287566257687813)

    def test_second_attempt_needs_more_games(self):
        self.assertFalse(balanced_familywise_test(flawless(14), attempt_index=2)[
            "statistical_threshold_met"])
        x = balanced_familywise_test(flawless(15), attempt_index=2)
        self.assertEqual(x["games"], 960)
        self.assertTrue(x["statistical_threshold_met"])
        self.assertEqual(x["allocated_one_sided_alpha"], "1/120")

    def test_many_candidate_budget_never_inflates(self):
        x = balanced_familywise_test(flawless(10), attempt_index=50)
        self.assertFalse(x["statistical_threshold_met"])
        self.assertEqual(x["allocated_one_sided_alpha"], "1/51000")

    def test_attempt_index_and_error_budget_are_validated(self):
        for i in (0, -1, True, 1.5):
            with self.subTest(i=i), self.assertRaises(ValueError):
                familywise_alpha(i)
        for bad in ("0", "1", "-0.01"):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                familywise_alpha(1, total_alpha=bad)


if __name__ == "__main__":
    unittest.main()
