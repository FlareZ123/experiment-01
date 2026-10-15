"""Independent small-deck exhaustive checks of the zone-exact calculations."""

import itertools
import unittest
import sys
from pathlib import Path
from fractions import Fraction
from math import comb

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))

from prize_opening_exact import radiant_gate, singleton_and_all_rescuers_prized


class ExactZoneTests(unittest.TestCase):
    def test_small_deck_exhaustive(self):
        deck = ['R', 'B', 'B', 'V', 'V'] + ['O'] * 5
        total = 0
        valid = 0
        benchable = 0
        gate = 0
        for hand in itertools.combinations(range(10), 2):
            remaining_after_hand = set(range(10)) - set(hand)
            for prizes in itertools.combinations(sorted(remaining_after_hand), 2):
                for draw in remaining_after_hand - set(prizes):
                    total += 1
                    hand_cards = [deck[i] for i in hand]
                    is_valid = 'R' in hand_cards or 'B' in hand_cards
                    valid += is_valid
                    is_benchable = ('B' in hand_cards and
                                    any(deck[i] == 'R' for i in (*hand, draw)))
                    benchable += is_benchable
                    gate += (is_benchable and
                             sum(c == 'V' for i, c in enumerate(deck)
                                 if i not in (*hand, *prizes, draw)) >= 1)
        exact = radiant_gate(2, 2, total=10, opening=2, prizes=2, required_vmax=1)
        self.assertEqual(exact['valid_opening'], Fraction(valid, total))
        self.assertEqual(exact['benchable_unconditional'], Fraction(benchable, total))
        self.assertEqual(exact['gate_unconditional'], Fraction(gate, total))

    def test_shadow_rider_reference(self):
        result = radiant_gate(13, 4)
        self.assertAlmostEqual(float(result['gate_given_valid']), 0.12017840120329253)
        self.assertAlmostEqual(float(result['benchable_given_valid']), 0.12359402587092864)
        self.assertGreater(radiant_gate(13, 4)['gate_given_valid'],
                           radiant_gate(13, 3)['gate_given_valid'])

    def test_coprizing_by_enumeration(self):
        for rescuers in range(4):
            observed = sum(
                set(range(rescuers + 1)).issubset(prize)
                for prize in itertools.combinations(range(10), 3)
            )
            self.assertEqual(singleton_and_all_rescuers_prized(
                rescuers, total=10, prizes=3), Fraction(observed, comb(10, 3)))


if __name__ == '__main__':
    unittest.main()
