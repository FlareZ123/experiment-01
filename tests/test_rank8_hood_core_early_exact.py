"""Independent original-seven, six-Prize, one-draw rank-8 hand gate tests."""
from fractions import Fraction
import random
import unittest

from scripts.rank8_hood_core_early_exact import exact, source_categories


class Rank8HoodCoreEarlyTests(unittest.TestCase):
    def test_actual_source_counts_and_exact_fraction(self):
        basics, core, groups, other = source_categories()
        self.assertEqual((basics, core, groups, other),
                         (10, (1, 1, 4), (4, 3, 1, 5, 2, 1, 0, 0), 28))
        result = exact()
        self.assertEqual(result["valid_start_seven"],
                         Fraction(216911, 292581))
        self.assertEqual(result["all_held_and_valid_start"],
                         Fraction(85787, 511724169))
        self.assertEqual(result["conditional_on_valid_start"],
                         Fraction(85787, 379377339))

    def test_independent_physical_deal(self):
        rng = random.Random(20261019)
        deck = (
            ["basic"] * 10 + ["secret", "shake"] + ["float"] * 4 +
            [label for i, count in enumerate((4, 3, 1, 5, 2, 1))
             for label in [f"discard{i}"] * count] + ["other"] * 28
        )
        self.assertEqual(len(deck), 60)
        valid = hits = 0
        for _ in range(200000):
            rng.shuffle(deck)
            if "basic" not in deck[:7]:
                continue
            valid += 1
            # Physical six Prizes are reserved at positions 7..12;
            # the first normal draw is position 13.
            seen = deck[:7] + [deck[13]]
            core = all(name in seen for name in ("secret", "shake", "float"))
            distinct_discard_names = sum(
                f"discard{i}" in seen for i in range(6)
            )
            if core and distinct_discard_names >= 3:
                hits += 1
        predicted = float(exact()["conditional_on_valid_start"])
        observed = hits / valid
        sigma = (predicted * (1 - predicted) / valid) ** 0.5
        self.assertGreater(valid, 130000)
        self.assertGreater(hits, 0)
        self.assertLess(abs(observed - predicted), 5 * sigma)


if __name__ == "__main__":
    unittest.main()
