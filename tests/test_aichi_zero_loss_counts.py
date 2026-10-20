"""Independent synthetic confidence tests for naturally variable start strata."""
import math
import unittest

from scripts.aichi_zero_loss_counts import (
    sharp_zero_loss_null_probability,
    assess_zero_loss_cells,
)


class SharpUnequalZeroLossTests(unittest.TestCase):
    def test_balanced_64_cells_all_wins(self):
        counts = [10] * 64
        self.assertAlmostEqual(
            sharp_zero_loss_null_probability(counts), 0.995 ** 640,
            places=12,
        )
        self.assertTrue(assess_zero_loss_cells(
            counts, total_wins=640)["statistical_threshold_met"])

    def test_balanced_128_cells_all_wins(self):
        counts = [5] * 128
        self.assertAlmostEqual(
            sharp_zero_loss_null_probability(counts), 0.995 ** 640,
            places=12,
        )

    def test_128_cell_start_side_confounded_all_win_panel(self):
        counts = [8, 2, 2, 8] * 32
        self.assertEqual(sum(counts), 640)
        self.assertAlmostEqual(
            sharp_zero_loss_null_probability(counts), 0.99 ** 128,
            places=12,
        )
        self.assertFalse(assess_zero_loss_cells(
            counts, total_wins=640)["statistical_threshold_met"])

    def test_zero_cells_make_target_unidentifiable(self):
        counts = [10] * 63 + [0]
        assessment = assess_zero_loss_cells(counts, total_wins=630)
        self.assertEqual(assessment["unobserved_cells"], 1)
        self.assertEqual(assessment["sharp_all_win_null_probability"], 1)
        self.assertFalse(assessment["statistical_threshold_met"])

    def test_nonwin_requires_a_different_statistical_test(self):
        assessment = assess_zero_loss_cells([10] * 64, total_wins=639)
        self.assertFalse(assessment["all_win_test_applicable"])
        self.assertIsNone(assessment["sharp_all_win_null_probability"])
        self.assertFalse(assessment["statistical_threshold_met"])

    def test_invalid_data_rejected(self):
        for counts in ([], [-1, 1], [0.5], [True]):
            with self.subTest(counts=counts):
                with self.assertRaises(ValueError):
                    sharp_zero_loss_null_probability(counts)
        with self.assertRaises(ValueError):
            sharp_zero_loss_null_probability([1, 2], target="1")
        with self.assertRaises(ValueError):
            assess_zero_loss_cells([1], total_wins=2)
        with self.assertRaises(ValueError):
            assess_zero_loss_cells([1], total_wins=1, confidence="0")


if __name__ == "__main__":
    unittest.main()
