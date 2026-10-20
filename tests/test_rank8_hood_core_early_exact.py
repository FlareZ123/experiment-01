"""Independent original-seven, six-Prize, one-draw rank-8 hand gate tests."""
from fractions import Fraction
from itertools import combinations
import random
import unittest

from scripts.rank8_hood_core_early_exact import (
    exact, source_categories, paired_unique_core_probability,
    rank8_flexible_box_shake_ceiling,
)


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
        expanded = exact(allow_same_name_duplicates=True)
        self.assertEqual(expanded["all_held_and_valid_start"],
                         Fraction(148540, 511724169))
        self.assertEqual(expanded["conditional_on_valid_start"],
                         Fraction(148540, 379377339))
        self.assertGreater(expanded["conditional_on_valid_start"],
                           result["conditional_on_valid_start"])

    def test_flexible_two_singletons_exact_fraction_and_legacy_scope(self):
        flexible = rank8_flexible_box_shake_ceiling()
        self.assertEqual(flexible["valid_start_seven"],
                         Fraction(216911, 292581))
        self.assertEqual(flexible["conditional_on_valid_start"],
                         Fraction(789802, 57481415))
        self.assertEqual(flexible["favorable_start_draw_pairs"], 208507728)
        self.assertEqual(flexible["valid_start_draw_pairs"], 15175093560)
        old = exact()["conditional_on_valid_start"]
        self.assertGreater(flexible["conditional_on_valid_start"], old)
        self.assertGreater(float(flexible["conditional_on_valid_start"] / old), 60)

    def test_flexible_probability_against_exhaustive_toy_physical_deals(self):
        # Eight physical cards: two Basics, two distinct singleton Items,
        # four other non-Basics; the original three must contain a Basic.
        total, basics, opening = 8, 2, 3
        box, shake = basics, basics + 1
        legal = hits = 0
        for first in combinations(range(total), opening):
            if not any(card < basics for card in first):
                continue
            for next_card in range(total):
                if next_card in first:
                    continue
                legal += 1
                if box in (*first, next_card) and shake in (*first, next_card):
                    hits += 1
        exact_toy = paired_unique_core_probability(total, basics, opening)
        self.assertEqual(exact_toy["favorable_start_draw_pairs"], hits)
        self.assertEqual(exact_toy["valid_start_draw_pairs"], legal)
        self.assertEqual(exact_toy["conditional_on_valid_start"],
                         Fraction(hits, legal))

    def test_independent_physical_deal(self):
        rng = random.Random(20261019)
        deck = (
            ["basic"] * 10 + ["secret", "shake"] + ["float"] * 4 +
            [label for i, count in enumerate((4, 3, 1, 5, 2, 1))
             for label in [f"discard{i}"] * count] + ["other"] * 28
        )
        self.assertEqual(len(deck), 60)
        valid = hits = duplicate_compatible_hits = 0
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
            if core and sum(
                card.startswith("discard") for card in seen
            ) >= 3:
                duplicate_compatible_hits += 1
        predicted = float(exact()["conditional_on_valid_start"])
        observed = hits / valid
        sigma = (predicted * (1 - predicted) / valid) ** 0.5
        self.assertGreater(valid, 130000)
        self.assertGreater(hits, 0)
        self.assertLess(abs(observed - predicted), 5 * sigma)
        alternative = float(
            exact(allow_same_name_duplicates=True)["conditional_on_valid_start"]
        )
        alternative_sigma = (alternative * (1 - alternative) / valid) ** 0.5
        self.assertGreaterEqual(duplicate_compatible_hits, hits)
        self.assertLess(
            abs(duplicate_compatible_hits / valid - alternative),
            5 * alternative_sigma,
        )


if __name__ == "__main__":
    unittest.main()
