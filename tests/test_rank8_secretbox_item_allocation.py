"""Regress exact rank-8 Secret Box search-opportunity probabilities."""
from collections import Counter
from fractions import Fraction
from itertools import combinations
from pathlib import Path
import importlib.util
import unittest

PATH = Path(__file__).resolve().parents[1] / "scripts" / "rank8_secretbox_item_allocation.py"
SPEC = importlib.util.spec_from_file_location("rank8_secretbox_item_allocation", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def brute_toy(numbers, opener, prizes):
    """Independently enumerate physical labeled opening, Prize and draw cards."""
    labels = tuple(category for category, quantity in enumerate(numbers)
                   for _ in range(quantity))
    cards = tuple(range(len(labels)))
    hit = Counter()
    valid = 0
    for opening in combinations(cards, opener):
        first = set(opening)
        if not any(labels[i] in (2, 6) for i in opening):
            continue
        undealt = tuple(i for i in cards if i not in first)
        for prized in combinations(undealt, prizes):
            unavailable = first.union(prized)
            for draw in (i for i in undealt if i not in unavailable):
                valid += 1
                hand = Counter(labels[i] for i in (*opening, draw))
                deck = Counter(labels[i] for i in cards if i not in
                               unavailable and i != draw)
                g = deck[5] > 0
                direct = bool(hand[1] and hand[2] and hand[4] and g)
                held_shake = bool(
                    hand[0] and hand[1] and g and (hand[4] or deck[4]) and
                    (hand[2] or (deck[2] and (hand[3] or deck[3]))))
                fetch_shake = bool(
                    hand[0] and not hand[1] and deck[1] and g and
                    (hand[4] or deck[4]) and
                    (hand[2] or (hand[3] and deck[2])))
                hit["direct_shake_trubbish_tool"] += int(direct)
                hit["box_held_shake_item_fetch_quickball"] += int(held_shake)
                hit["box_fetch_shake_trubbish_or_held_quickball"] += int(fetch_shake)
                hit["any_of_three_routes"] += int(
                    direct or held_shake or fetch_shake)
    return {name: Fraction(value, valid) for name, value in hit.items()}


class Rank8AllocationTests(unittest.TestCase):
    def test_authenticated_source_categories(self):
        self.assertEqual(MODULE.original_rank8_categories(),
                         (1, 1, 2, 4, 5, 2, 8, 37))

    def test_original_exact_fractions(self):
        result = MODULE.exact_opportunities((1, 1, 2, 4, 5, 2, 8, 37))
        expected = {
            "direct_shake_trubbish_tool": Fraction(54091677403, 3353695676760),
            "box_held_shake_item_fetch_quickball":
                Fraction(202883516489977, 15447122287156560),
            "box_fetch_shake_trubbish_or_held_quickball":
                Fraction(14126543204999, 257452038119276),
            "box_fetch_shake_trubbish_seen":
                Fraction(378035576474319, 12872601905963800),
            "box_fetch_shake_quickball_held":
                Fraction(6699828240319, 262706161346200),
            "any_of_three_routes": Fraction(8929632158717, 108021834175920),
            "direct_and_box_held_shake":
                Fraction(2462546267, 1676847838380),
        }
        self.assertEqual(result["conditional"], expected)
        self.assertEqual(result["basic_valid_seven"], Fraction(216911, 292581))
        self.assertEqual(result["hand_compositions"], 844)

    def test_independent_full_physical_toy(self):
        counts = (1, 1, 1, 1, 1, 1, 2, 4)
        exact = MODULE.exact_opportunities(
            counts, opener=3, prizes=2)["conditional"]
        independent = brute_toy(counts, opener=3, prizes=2)
        for route, probability in independent.items():
            self.assertEqual(exact[route], probability, route)


if __name__ == "__main__":
    unittest.main()
