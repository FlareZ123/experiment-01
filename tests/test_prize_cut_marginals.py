"""Independent physical-hand-and-Prize enumeration for the marginal model."""
import unittest
from itertools import combinations
from fractions import Fraction
from scripts.prize_cut_marginals import prize_cut_probabilities


class PrizeMarginalTests(unittest.TestCase):
    def test_small_deck(self):
        cards = ["A", "B", "H", "O", "X", "X", "X", "X", "X"]
        valid = cut = joint = 0
        total = 0
        for hand in combinations(range(9), 2):
            legal = any(cards[i] in ("A", "B", "O") for i in hand)
            rest = set(range(9)) - set(hand)
            for prize in combinations(sorted(rest), 3):
                total += 1
                stranded = sum(cards[i] in ("A", "B") for i in prize)
                rescued = sum(cards[i] == "H" for i in prize) == 0
                bad = stranded > int(rescued)
                valid += legal
                cut += bad
                joint += bad and legal
        result = prize_cut_probabilities(
            (1, 1), 1, 1, deck_size=9, opening=2, prizes=3
        )
        self.assertEqual(result["valid_opening"], Fraction(valid, total))
        self.assertEqual(result["cut_unconditional"], Fraction(cut, total))
        self.assertEqual(result["cut_and_valid_opening"], Fraction(joint, total))
        self.assertEqual(
            result["cut_given_valid_opening"], Fraction(joint, valid)
        )

    def test_published_champion(self):
        result = prize_cut_probabilities((1, 1), 1, 12)
        self.assertEqual(result["cut_unconditional"], Fraction(83, 3422))
        self.assertEqual(
            result["cut_given_valid_opening"], Fraction(139744719, 5904101632)
        )
        self.assertEqual(
            result["cut_and_valid_opening"], Fraction(15527191, 761555834)
        )


if __name__ == "__main__":
    unittest.main()
