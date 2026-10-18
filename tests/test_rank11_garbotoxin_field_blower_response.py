"""Pure exact fractions for early Garbotoxin Tool-removal resource access."""
import sys
import unittest
from fractions import Fraction
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from rank11_garbotoxin_field_blower_response import DECKS, EVENTS, exact_response_rates


class GarbotoxinResponseTest(unittest.TestCase):
    def test_immutable_source_categories(self):
        self.assertEqual(DECKS["source_champion_rank1"], (14, 0, 1, 0, 45))
        self.assertEqual(DECKS["hood_shield_v1"], (14, 1, 1, 2, 42))
        self.assertEqual(set(EVENTS), set(exact_response_rates(DECKS["hood_shield_v1"])))

    def test_direct_blower_invariant_between_source_lists(self):
        champion = exact_response_rates(DECKS["source_champion_rank1"])
        hood = exact_response_rates(DECKS["hood_shield_v1"])
        expected = Fraction(8530787, 66788480)
        self.assertEqual(champion["direct_field_blower"], expected)
        self.assertEqual(hood["direct_field_blower"], expected)
        self.assertEqual(champion["additional_arven_to_unprized_field_blower"], 0)

    def test_arven_recovery_exact(self):
        p = exact_response_rates(DECKS["hood_shield_v1"])
        self.assertEqual(
            p["additional_arven_to_unprized_field_blower"],
            Fraction(13403273, 133576960),
        )
        self.assertEqual(p["union_field_blower_or_arven"], Fraction(30464847, 133576960))
        self.assertGreater(p["union_field_blower_or_arven"], p["direct_field_blower"])

    def test_arven_multiaxis_exact_and_subset(self):
        p = exact_response_rates(DECKS["hood_shield_v1"])
        self.assertEqual(
            p["arven_with_field_blower_and_hood_resources"],
            Fraction(28372022819, 249788915200),
        )
        self.assertGreater(p["arven_with_field_blower_and_hood_resources"], 0)
        self.assertLessEqual(
            p["arven_with_field_blower_and_hood_resources"],
            p["union_field_blower_or_arven"],
        )


if __name__ == "__main__":
    unittest.main()
