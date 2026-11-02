"""Exact finite prize-check regression against original source printed 60s."""

import importlib.util
from fractions import Fraction
from itertools import combinations
from pathlib import Path
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "agent17_raichu_temple_prize_windows.py"
spec = importlib.util.spec_from_file_location("agent17_raichu_temple_prize_windows", SCRIPT)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class TestOriginalTemplePrizeWindows(unittest.TestCase):
    def test_conditional_probability_matches_exhaustive_small_deck(self):
        cards = range(9)
        basics = {0, 1, 2}
        targets = {0, 3}
        total = accepted = 0
        for hand in combinations(cards, 3):
            if not basics.intersection(hand):
                continue
            remain = [card for card in cards if card not in hand]
            for prize in combinations(remain, 2):
                total += 1
                accepted += targets.issubset(prize)
        exact = Fraction(accepted, total)
        self.assertEqual(
            audit.all_prized_given_valid_opener(
                3, 2, 1, deck_size=9, opener_size=3, prizes=2
            ),
            exact
        )

    def test_accepted_basic_valid_opener_counts_exact_originals(self):
        result = audit.source_locked_audit()
        self.assertEqual(result["sourceBasicCards"], {"4": 13, "17": 13})
        self.assertEqual(result["candidateBasicCards"], 15)
        self.assertEqual(result["competitivelyQualifiedGames"], 0)
        self.assertFalse(result["naturalGameWitness"])

    def test_candidate_both_temple_prized_is_above_eight_tenths_percent(self):
        result = audit.source_locked_audit()
        self.assertEqual(result["candidateBothTemplePrized"]["exact"], "10324999/1204256460")
        self.assertGreater(result["candidateBothTemplePrized"]["percent"], 0.8)
        self.assertNotEqual(
            Fraction(result["candidateBothTemplePrized"]["exact"]),
            Fraction(1, 118)
        )

    def test_source_rank4_Stadium_and_escape_rope_joint_availability(self):
        result = audit.source_locked_audit()
        self.assertEqual(result["rank4AllThreeSkyFieldPrized"]["exact"], "15808760/26482472211")
        self.assertEqual(
            result["rank4HasSkyFieldAndEscapeRopeOutsidePrizes"]["exact"],
            "28514021951585/28548105043458"
        )

    def test_rank17_basic_marshadow_is_not_treated_as_nonbasic_prize(self):
        result = audit.source_locked_audit()
        self.assertEqual(
            result["rank17PokeStopAndBasicMarshadowPrized"]["exact"],
            "56170320/6750434093"
        )
        self.assertEqual(
            result["rank17HasEitherStadiumAnswerAndEscapeRopeOutsidePrizes"]["exact"],
            "919540248595051/927813413912385"
        )
        self.assertLess(
            Fraction(result["rank17PokeStopAndBasicMarshadowPrized"]["exact"]),
            Fraction(1, 118)
        )

    def test_invalid_target_basic_counts_fail_closed(self):
        with self.assertRaises(AssertionError):
            audit.all_prized_given_valid_opener(13, 2, 3)
        with self.assertRaises(AssertionError):
            audit.all_prized_given_valid_opener(13, 7, 0)


if __name__ == "__main__":
    unittest.main()
