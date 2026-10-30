"""Independent source and physical-deal regressions of rank8 Item connectors."""
from collections import Counter
from fractions import Fraction
from itertools import combinations
from pathlib import Path
import importlib.util
import unittest

FILE = Path(__file__).resolve().parents[1] / "scripts" / "rank8_secretbox_firstturn_connectivity.py"
SPEC = importlib.util.spec_from_file_location("rank8_secretbox_firstturn_connectivity", FILE)
MODEL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODEL)


def brute_toy(categories, opener, prizes):
    """Enumerate every physical labeled seven/Prize/draw-style toy history."""
    pool = [type_index for type_index, count in enumerate(categories)
            for _ in range(count)]
    cards = tuple(range(len(pool)))
    totals = Counter()
    valid = 0
    for opening_tuple in combinations(cards, opener):
        opening = set(opening_tuple)
        if not any(pool[i] in (2, 9) for i in opening):
            continue
        remainder = [i for i in cards if i not in opening]
        for prize_tuple in combinations(remainder, prizes):
            prize_cards = set(prize_tuple)
            for draw in (i for i in remainder if i not in prize_cards):
                valid += 1
                hand = Counter(pool[i] for i in opening.union({draw}))
                deck = Counter(pool[i] for i in cards if i not in opening
                               and i not in prize_cards and i != draw)
                box, shake, trub, qb, ultra, vip, bag, tool = (
                    hand[i] for i in range(8))
                g = deck[8] > 0
                has_trub = deck[2] > 0
                basic_search = qb > 0 or ultra > 0 or vip > 0
                deck_search = deck[3] > 0 or deck[4] > 0 or deck[5] > 0
                tool_access = tool > 0 or deck[7] > 0
                direct = bool(
                    shake and g and (trub or (has_trub and basic_search)) and
                    (tool or (bag and deck[7])))
                both = bool(
                    box and shake and g and tool_access and
                    (trub or (has_trub and (basic_search or deck_search))))
                fetch = bool(
                    box and not shake and deck[1] and g and tool_access and
                    (trub or (has_trub and basic_search)))
                minimal_direct = bool(shake and trub and tool and g)
                minimal_both = bool(
                    box and shake and g and tool_access and
                    (trub or (has_trub and (qb or deck[3]))))
                minimal_fetch = bool(
                    box and not shake and deck[1] and g and tool_access and
                    (trub or (qb and has_trub)))
                for name, flag in zip(MODEL.ROUTES, (
                    direct, both, fetch, direct or both or fetch,
                    minimal_direct or minimal_both or minimal_fetch)):
                    totals[name] += int(flag)
    return {name: Fraction(totals[name], valid) for name in MODEL.ROUTES}


class ExactConnectivityTests(unittest.TestCase):
    def test_authenticated_source_categories(self):
        self.assertEqual(MODEL.original_categories(),
                         (1, 1, 2, 4, 2, 2, 1, 5, 2, 8, 32))

    def test_original_exact_output_and_prior_model_preservation(self):
        result = MODEL.exact_connectivity(
            (1, 1, 2, 4, 2, 2, 1, 5, 2, 8, 32))
        self.assertEqual(result["conditional"], {
            "held_shake_with_hand_search_connectors":
                Fraction(104608679312523, 2340473073811600),
            "both_box_and_shake_with_item_search_connector":
                Fraction(26011400864403, 1980400293225200),
            "box_fetches_shake_with_held_basic_search_connector":
                Fraction(2753920708527887, 38617805717891400),
            "union_extended_connectors":
                Fraction(9665521485442441, 77235611435782800),
            "union_minimal_connectors":
                Fraction(8929632158717, 108021834175920),
        })
        self.assertEqual(result["basic_valid_seven"], Fraction(216911, 292581))

    def test_independent_labeled_physical_toy(self):
        toy = (1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2)
        exact = MODEL.exact_connectivity(
            toy, opener=3, prizes=2)["conditional"]
        independent = brute_toy(toy, opener=3, prizes=2)
        self.assertEqual(exact, independent)


if __name__ == "__main__":
    unittest.main()
