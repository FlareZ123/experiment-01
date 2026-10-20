"""Exact prospective-futility mathematics, independent of game simulation."""

import unittest
from fractions import Fraction

from scripts.aichi_rank_target_futility import (
    TARGET_WIN_RATE, binomial_upper_tail, max_nonwin_rate,
    minimum_rejecting_nonwins,
)


class AichiRankFutilityTest(unittest.TestCase):
    def test_target_and_group_ceilings(self):
        self.assertEqual(TARGET_WIN_RATE, Fraction(199, 200))
        expected = {1: Fraction(4, 25), 2: Fraction(2, 25),
                    4: Fraction(1, 25), 8: Fraction(1, 50),
                    29: Fraction(4, 725), 32: Fraction(1, 200)}
        for group, ceiling in expected.items():
            with self.subTest(group=group):
                self.assertEqual(max_nonwin_rate(32, group), ceiling)

    def test_exact_tail_and_minimum_fixed_horizon_rejection(self):
        cases = (
            (1, 16, 6, Fraction(3152898683325889, 10**17)),
            (2, 16, 4, Fraction(3416569507809504, 10**17)),
            (4, 8, 2, Fraction(3814722802155519, 10**17)),
            (4, 16, 3, Fraction(2424451625036369, 10**17)),
            (8, 12, 2, Fraction(2310775208524894, 10**17)),
            (32, 8, 1, Fraction(3930695642456313, 10**17)),
            (29, 8, 1, Fraction(4329495268602712, 10**17)),
        )
        for group, n, k, decimal_approx in cases:
            with self.subTest(group=group, n=n):
                q = max_nonwin_rate(32, group)
                self.assertEqual(minimum_rejecting_nonwins(n, q), k)
                self.assertLessEqual(binomial_upper_tail(n, k, q), Fraction(1, 20))
                self.assertGreater(binomial_upper_tail(n, k - 1, q), Fraction(1, 20))
                self.assertAlmostEqual(float(binomial_upper_tail(n, k, q)),
                                       float(decimal_approx), places=14)

    def test_binomial_boundaries_and_exact_arithmetic(self):
        self.assertEqual(binomial_upper_tail(8, 1, Fraction(1, 200)),
                         1 - Fraction(199, 200) ** 8)
        self.assertEqual(binomial_upper_tail(8, 8, Fraction(1, 4)),
                         Fraction(1, 4) ** 8)
        self.assertEqual(binomial_upper_tail(8, 0, Fraction(1, 4)), 1)
        self.assertIsNone(minimum_rejecting_nonwins(
            1, Fraction(1, 2), Fraction(1, 1000)))

    def test_rejects_invalid_domains(self):
        for call in (
            lambda: max_nonwin_rate(32, 33),
            lambda: max_nonwin_rate(32, 0),
            lambda: max_nonwin_rate(32, 4, Fraction(101, 100)),
            lambda: binomial_upper_tail(16, 17, Fraction(1, 25)),
            lambda: minimum_rejecting_nonwins(0, Fraction(1, 25)),
        ):
            with self.assertRaises(ValueError):
                call()


if __name__ == "__main__":
    unittest.main()
