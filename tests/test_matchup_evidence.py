"""Regression tests for exact win-rate evidence calculations."""
import math
import unittest

from scripts.matchup_evidence import (
    SeatRecord, exact_lower, minimum_all_wins, summarize,
)


class EvidenceTests(unittest.TestCase):
    def test_exact_bound_endpoints(self):
        self.assertAlmostEqual(exact_lower(10, 10, 0.05), 0.05 ** 0.1, places=12)
        self.assertEqual(exact_lower(0, 10, 0.05), 0.0)
        self.assertAlmostEqual(exact_lower(8, 10, 0.05), 0.4930986989368, places=10)

    def test_all_wins_requirements(self):
        self.assertEqual(minimum_all_wins(0.995, 0.05), 598)
        self.assertEqual(minimum_all_wins(0.995, 0.05 / 29), 1270)
        self.assertEqual(minimum_all_wins(0.995, 0.05 / 32), 1290)
        self.assertEqual(minimum_all_wins(0.995, 0.05 / 64), 1428)
        n = minimum_all_wins(0.995, 0.05 / 64)
        self.assertLessEqual((0.05 / 64) ** (1 / (n - 1)), 0.995)
        self.assertGreater((0.05 / 64) ** (1 / n), 0.995)

    def test_missing_cells_never_disappear_from_denominator(self):
        data = summarize([SeatRecord(1, "first", 10, 10)], placements=[1, 2])
        self.assertFalse(data["complete"])
        self.assertIsNone(data["equal_rank_equal_seat_point_rate"])
        self.assertEqual(len(data["missing"]), 3)
        self.assertEqual(len(data["cells"]), 4)
        self.assertFalse(data["statistical_threshold_met"])
        self.assertLess(data["simultaneous_lower"], 0.25)

    def test_complete_balanced_field(self):
        rows = [SeatRecord(r, s, 1428, 1428) for r in (1, 2)
                for s in ("first", "second")]
        data = summarize(rows, placements=[1, 2])
        self.assertTrue(data["complete"])
        self.assertEqual(data["equal_rank_equal_seat_point_rate"], 1.0)
        self.assertGreater(data["simultaneous_lower"], 0.995)
        self.assertTrue(data["statistical_threshold_met"])

    def test_reject_invalid_and_duplicate_cells(self):
        bad_inputs = (
            [SeatRecord(1, "first", 2, 1)],
            [SeatRecord(2, "first", 1, 1)],
            [SeatRecord(1, "first", 1, 1), SeatRecord(1, "first", 1, 1)],
        )
        for rows in bad_inputs:
            with self.subTest(rows=rows), self.assertRaises(ValueError):
                summarize(rows, placements=[1])


if __name__ == "__main__":
    unittest.main()
