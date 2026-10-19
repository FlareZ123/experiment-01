"""Deterministic exact and independent physical-deal regressions."""
import sys
import unittest
from fractions import Fraction
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from newmoon_locked_first_window import exact_window


def independent_physical_deal(deck, opening, prizes, basics):
    """Enumerate hand -> six-like Prizes -> normal draw on distinct cards."""
    total = len(deck)
    indices = set(range(total))
    legal = early_donor = compressor_donor = 0
    for opener in combinations(range(total), opening):
        chosen = set(opener)
        hand = [deck[i] for i in opener]
        if not any(card in basics for card in hand):
            continue
        for prize in combinations(sorted(indices - chosen), prizes):
            deck_after_prizes = indices - chosen - set(prize)
            for drawn in deck_after_prizes:
                legal += 1
                observed = hand + [deck[drawn]]
                if "M" not in hand or "C" not in observed:
                    continue
                if "D" in observed:
                    early_donor += 1
                elif "B" in observed and any(
                    deck[i] == "D" for i in deck_after_prizes if i != drawn
                ):
                    compressor_donor += 1
    return {
        "donor_in_first_eight": Fraction(early_donor, legal),
        "compressor_to_unprized_donor": Fraction(compressor_donor, legal),
        "either_disjoint_route": Fraction(early_donor + compressor_donor, legal),
    }


class ExactWindowTest(unittest.TestCase):
    def test_two_counter_both_gx_donors(self):
        p = exact_window()
        self.assertEqual(p["either_disjoint_route"], Fraction(187274164, 9380544359))
        self.assertAlmostEqual(100 * float(p["either_disjoint_route"]), 1.996410409)

    def test_one_gengar_donor(self):
        p = exact_window(donors=1)
        self.assertEqual(p["either_disjoint_route"], Fraction(2582688, 176991403))

    def test_any_four_counters(self):
        p = exact_window(counters=4)
        self.assertEqual(p["either_disjoint_route"], Fraction(75492239438, 2073100303339))

    def test_no_counter_frontier(self):
        p = exact_window(require_counter=False)
        self.assertEqual(p["either_disjoint_route"], Fraction(17338986, 176991403))
        self.assertLess(exact_window()["either_disjoint_route"], p["either_disjoint_route"])

    def test_independent_toy_deal_with_actual_setup_order(self):
        # All physical cards distinct by index; two M + two D are valid Basics.
        deck = ["M", "M", "D", "D", "C", "B", "C", "O", "O", "O", "O"]
        physical = independent_physical_deal(deck, 3, 2, {"M", "D"})
        exact = exact_window(
            deck_size=11, opening=3, prizes=2, basic_count=4,
            mewtwo=2, donors=2, counters=2, compressors=1,
        )
        self.assertEqual(physical, exact)
        self.assertEqual(exact["either_disjoint_route"], Fraction(115, 546))

    def test_donor_routes_disjoint(self):
        p = exact_window()
        self.assertEqual(
            p["donor_in_first_eight"] + p["compressor_to_unprized_donor"],
            p["either_disjoint_route"],
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
