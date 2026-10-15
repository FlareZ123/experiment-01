"""Independent exact and seeded checks of one Ranger response tech."""
import random
import unittest
from fractions import Fraction
from math import comb

from scripts.ranger_opening_access import opening_access


class RangerOpeningTests(unittest.TestCase):
    def test_singleton_and_convenient_copy_counts(self):
        result = opening_access(1)
        self.assertAlmostEqual(float(result["direct_given_valid"]), 0.11095396616302691)
        self.assertAlmostEqual(float(result["wonder_tag_given_valid"]), 0.16119716678684706)
        self.assertAlmostEqual(float(result["combined_given_valid"]), 0.272151132949874)
        expected = [0, 0.26889443171936234, 0.3738478626853014,
                    0.4501101733670259, 0.5172087498033753]
        for n, value in enumerate(expected):
            with self.subTest(copies=n):
                self.assertAlmostEqual(float(opening_access(n)["combined_given_valid"]), value)

    def test_direct_singleton_independently(self):
        result = opening_access(1)
        valid = Fraction(comb(60, 7) - comb(46, 7), comb(60, 7))
        ranger_in_hand = Fraction(7, 60)
        ranger_in_hand_without_basic = Fraction(7, 60) * Fraction(comb(45, 6), comb(59, 6))
        self.assertEqual(result["valid_opening_probability"], valid)
        self.assertEqual(result["direct_given_valid"],
                         (ranger_in_hand - ranger_in_hand_without_basic) / valid)

    def test_seeded_deal_sampling(self):
        rng = random.Random(20261015)
        deck = "R" + "L" * 2 + "B" * 12 + "N" * 45
        valid = found = 0
        for _ in range(100000):
            sample = rng.sample(range(60), 13)
            hand = [deck[i] for i in sample[:7]]
            if not ("L" in hand or "B" in hand):
                continue
            valid += 1
            if "R" in hand or (
                "L" in hand and ("B" in hand or hand.count("L") >= 2)
                and not any(deck[i] == "R" for i in sample[7:])
            ):
                found += 1
        self.assertAlmostEqual(found / valid, float(opening_access(1)["combined_given_valid"]), delta=0.006)

    def test_rejects_unphysical_counts(self):
        for copies in (-1, 50):
            with self.subTest(copies=copies), self.assertRaises(ValueError):
                opening_access(copies)
        with self.assertRaises(TypeError):
            opening_access(1.5)


if __name__ == "__main__":
    unittest.main()
