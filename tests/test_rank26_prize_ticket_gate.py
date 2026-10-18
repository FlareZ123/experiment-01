"""Independent physical-deal and published-source rank26 regressions."""
import unittest
from fractions import Fraction
from itertools import combinations
from pathlib import Path

from scripts.rank26_prize_ticket_gate import (
    prized_nonbasic_group_conditional, rank26_inventory,
)


class Rank26PrizeTicketTests(unittest.TestCase):
    def test_complete_miniature_physical_deals(self):
        cards = ("B", "B", "B", "D", "T", "N", "N", "N", "N")
        legal = 0
        paired = 0
        dce = 0
        for hand in combinations(range(len(cards)), 2):
            if not any(cards[i] == "B" for i in hand):
                continue
            available = [i for i in range(len(cards)) if i not in hand]
            for prize_positions in combinations(available, 3):
                legal += 1
                dce += 3 in prize_positions
                paired += 3 in prize_positions and 4 in prize_positions
        self.assertEqual(
            prized_nonbasic_group_conditional(
                1, deck_size=9, basics=3, opening=2, prizes=3
            ),
            Fraction(dce, legal),
        )
        self.assertEqual(
            prized_nonbasic_group_conditional(
                2, deck_size=9, basics=3, opening=2, prizes=3
            ),
            Fraction(paired, legal),
        )

    def test_rank26_source_gate(self):
        manifest = (
            Path(__file__).resolve().parents[1]
            / "results/aichi-2026/full-decklists.json"
        )
        self.assertEqual(rank26_inventory(manifest), (60, 12))
        self.assertEqual(
            prized_nonbasic_group_conditional(1),
            Fraction(8432059, 83669828),
        )
        self.assertEqual(
            prized_nonbasic_group_conditional(2),
            Fraction(2340430, 271926941),
        )


if __name__ == "__main__":
    unittest.main()
