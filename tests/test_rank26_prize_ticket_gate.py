"""Independent physical-deal and published-source rank26 regressions."""
import unittest
from fractions import Fraction
from itertools import combinations, permutations
from pathlib import Path

from scripts.rank26_prize_ticket_gate import (
    prized_nonbasic_group_conditional, rank26_inventory,
    ticket_held_exchange_probabilities,
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

    def test_ticket_k0_distribution_and_k1_deck_risk(self):
        # Physical opening, then Prizes, then ordered deck: no independence
        # or replacement assumption. Ticket and DCE are each singleton
        # non-Basics (indices 5 and 4); four Basics occupy indices 0..3.
        cards = tuple(range(10))
        total = initially_prized = newly_prized = initially_in_deck = 0
        reprized_from_deck = held_dce = 0
        for hand in combinations(cards, 3):
            if 5 not in hand or not any(i < 4 for i in hand):
                continue
            remaining = tuple(i for i in cards if i not in hand)
            for prizes in combinations(remaining, 3):
                deck = tuple(i for i in remaining if i not in prizes)
                for deck_order in permutations(deck):
                    total += 1
                    initially_prized += 4 in prizes
                    newly_prized += 4 in deck_order[:3]
                    initially_in_deck += 4 in deck
                    reprized_from_deck += (4 in deck and
                                           4 in deck_order[:3])
                    held_dce += 4 in hand
        result = ticket_held_exchange_probabilities(
            deck_size=10, basics=4, opening=3, prizes=3
        )
        self.assertEqual(result["dce_in_opening"], Fraction(held_dce, total))
        self.assertEqual(result["dce_initially_prized"],
                         Fraction(initially_prized, total))
        self.assertEqual(result["dce_after_ticket_prized"],
                         Fraction(newly_prized, total))
        self.assertEqual(result["dce_initially_in_deck"],
                         Fraction(initially_in_deck, total))
        self.assertEqual(result[
            "new_prize_risk_given_dce_initially_in_deck"
        ], Fraction(reprized_from_deck, initially_in_deck))
        self.assertEqual(result[
            "new_prize_risk_given_dce_initially_prized"
        ], Fraction(0))
        source = ticket_held_exchange_probabilities()
        self.assertEqual(source["dce_initially_prized"],
                         Fraction(808014, 7874263))
        self.assertEqual(source["dce_after_ticket_prized"],
                         Fraction(808014, 7874263))
        self.assertEqual(source[
            "new_prize_risk_given_dce_initially_in_deck"
        ], Fraction(6, 47))

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
