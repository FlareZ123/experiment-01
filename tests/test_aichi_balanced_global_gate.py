"""Synthetic controls for the fixed-horizon global null hypothesis test."""
import unittest

from scripts.matchup_evidence import SeatRecord
from scripts.aichi_balanced_global_gate import balanced_global_test


def records(n=10, nonwins=0):
    out = [SeatRecord(r, s, n, n) for r in range(1, 33) for s in ("first", "second")]
    out[0] = SeatRecord(1, "first", n - nonwins, n)
    return out


class BalancedGlobalGateTests(unittest.TestCase):
    def test_640_flawless_wins_pass(self):
        x = balanced_global_test(records())
        self.assertEqual((x["games"], x["nonwins"]), (640, 0))
        self.assertAlmostEqual(x["conservative_p_value"], .04043632488927978, places=12)
        self.assertTrue(x["statistical_threshold_met"])

    def test_960_one_nonwin_pass(self):
        x = balanced_global_test(records(15, 1))
        self.assertEqual((x["games"], x["nonwins"]), (960, 1))
        self.assertAlmostEqual(x["conservative_p_value"], .047357402679233884, places=12)
        self.assertTrue(x["statistical_threshold_met"])

    def test_640_one_nonwin_fails(self):
        self.assertFalse(balanced_global_test(records(10, 1))["statistical_threshold_met"])

    def test_comparison_inapplicable(self):
        x = balanced_global_test(records(10, 8))
        self.assertFalse(x["hoeffding_comparison_applicable"])
        self.assertEqual(x["conservative_p_value"], 1.0)

    def test_every_cell_must_be_present_and_balanced(self):
        with self.assertRaises(ValueError):
            balanced_global_test(records()[:-1])
        with self.assertRaises(ValueError):
            balanced_global_test(records() + records()[:1])
        x = records()
        x[0] = SeatRecord(1, "first", 9, 9)
        with self.assertRaises(ValueError):
            balanced_global_test(x)

    def test_inputs_validated(self):
        x = records()
        x[0] = SeatRecord(1, "first", 11, 10)
        with self.assertRaises(ValueError):
            balanced_global_test(x)
        for options in ({"target": "1"}, {"confidence": "0"}):
            with self.assertRaises(ValueError):
                balanced_global_test(records(), **options)


if __name__ == "__main__":
    unittest.main()
