"""Independent physical hand-then-Prize regression for Agent27's count."""
from fractions import Fraction
from itertools import combinations
from pathlib import Path
import unittest

from scripts.rank26_ticket_connector_opening import (
    initial_search_item_bins, rank26_search_item_bins,
)


def brute_bins(*, n: int, b: int, search: int, hand: int, prizes: int):
    """Enumerate labelled-card subsets with a separate, direct event test."""
    cards = (["T", "D"] + ["B"] * b + ["S"] * search
             + ["X"] * (n - 2 - b - search))
    numerator = [0, 0, 0]
    denominator = 0
    for held in combinations(range(n), hand):
        held_set = set(held)
        if "B" not in (cards[i] for i in held):
            continue
        unseen = [i for i in range(n) if i not in held_set]
        for facedown in combinations(unseen, prizes):
            denominator += 1
            if 0 not in held or 1 not in facedown:
                continue
            held_search = sum(cards[i] == "S" for i in held)
            numerator[min(held_search, 2)] += 1
    return tuple(Fraction(count, denominator) for count in numerator)


class TicketConnectorTests(unittest.TestCase):
    def test_independent_physical_deals(self):
        for params in (
            dict(n=11, b=2, search=3, hand=4, prizes=2),
            dict(n=10, b=3, search=2, hand=3, prizes=2),
            dict(n=9, b=2, search=0, hand=3, prizes=2),
        ):
            with self.subTest(params=params):
                exact = initial_search_item_bins(
                    deck_size=params["n"], basics=params["b"],
                    search_items=params["search"],
                    opening=params["hand"], prizes=params["prizes"]
                )
                observed = brute_bins(**params)
                self.assertEqual(observed, (
                    exact["zero_held_search"],
                    exact["one_held_search"],
                    exact["two_or_more_held_search"],
                ))
                self.assertEqual(sum(observed), exact["ticket_held_dce_prized"])

    def test_rank26_exact_60_counts(self):
        eight = initial_search_item_bins(search_items=8)
        eleven = initial_search_item_bins(search_items=11)
        self.assertEqual(eight["zero_held_search"],
                         Fraction(4376673, 920368108))
        self.assertEqual(eight["one_held_search"],
                         Fraction(61012, 13024077))
        self.assertEqual(eight["two_or_more_held_search"],
                         Fraction(1260994, 690276081))
        self.assertEqual(eleven["zero_held_search"],
                         Fraction(828583, 251009484))
        self.assertEqual(eleven["one_held_search"],
                         Fraction(109937, 22819044))
        self.assertEqual(eleven["two_or_more_held_search"],
                         Fraction(790159, 251009484))
        self.assertEqual(eight["ticket_held_dce_prized"],
                         Fraction(942683, 83669828))
        self.assertEqual(eleven["ticket_held_dce_prized"],
                         Fraction(942683, 83669828))

    def test_genuine_rank26_source_is_guarded(self):
        manifest = (
            Path(__file__).resolve().parents[1]
            / "results" / "aichi-2026" / "full-decklists.json"
        )
        scopes = rank26_search_item_bins(manifest)
        self.assertEqual(scopes["eight_unrestricted_search_items"],
                         initial_search_item_bins(search_items=8))
        self.assertEqual(scopes["eleven_including_first_turn_vip"],
                         initial_search_item_bins(search_items=11))

    def test_impossible_cases_rejected(self):
        for params in (
            dict(deck_size=11, basics=2, search_items=9),
            dict(deck_size=11, basics=0, search_items=3),
            dict(deck_size=11, basics=2, search_items=3, opening=10, prizes=2),
        ):
            with self.subTest(params=params):
                with self.assertRaises(ValueError):
                    initial_search_item_bins(**params)


if __name__ == "__main__":
    unittest.main()
