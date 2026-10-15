"""Exact checks plus independently shuffled-deck validation of Item paths."""
import random
import sys
import unittest
from fractions import Fraction
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from prize_opening_exact import radiant_gate
from radiant_item_routes import item_routes


class RadiantItemRoutesTest(unittest.TestCase):
    def test_exact_reference_and_zero_connectors(self):
        result = item_routes()
        self.assertEqual(result['direct'], radiant_gate(13, 4)['gate_given_valid'])
        self.assertEqual(result['search'], Fraction(20808983269, 55634803840))
        self.assertEqual(result['heavy'], Fraction(121298091771, 9791725475840))
        self.assertEqual(result['total'], Fraction(4960433059823, 9791725475840))
        none = item_routes(treasure=0, quick=0, heavy=0)
        self.assertEqual(none['total'], none['direct'])
        self.assertEqual(none['search'], 0)
        self.assertEqual(none['heavy'], 0)

    def test_independent_random_shuffles(self):
        deck = ['R'] + ['B'] * 13 + ['V'] * 4 + ['M'] * 4 + ['Q'] + ['H'] + ['O'] * 36
        rng = random.Random(20261015)
        trials = 100000
        valid = 0
        counts = {'direct': 0, 'search': 0, 'heavy': 0}
        for _ in range(trials):
            rng.shuffle(deck)
            opening = deck[:7]
            prizes = deck[7:13]
            seen = deck[:7] + [deck[13]]
            if 'R' not in opening and 'B' not in opening:
                continue
            valid += 1
            if 'B' not in opening or deck[14:].count('V') < 2:
                continue
            if 'R' in seen:
                counts['direct'] += 1
            elif 'R' in prizes and 'H' in seen:
                counts['heavy'] += 1
            elif 'R' in deck[14:] and ('M' in seen or 'Q' in seen):
                counts['search'] += 1
        exact = item_routes()
        for name, count in counts.items():
            self.assertAlmostEqual(count / valid, float(exact[name]), delta=0.006)


if __name__ == '__main__':
    unittest.main()
