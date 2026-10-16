"""Independent physical-deal checks for mixed-role Prize feasibility."""
import unittest
from fractions import Fraction
from itertools import combinations
from scripts.combo_prize_feasibility import combo_prize_cuts


class ComboPrizeTests(unittest.TestCase):
    def test_small_indexed_deals(self):
        cards = ["A", "B", "N", "H", "O", "F", "F", "F", "F"]
        legal_count = basic = nonbasic = either = 0
        for hand in combinations(range(9), 2):
            legal = any(cards[i] in ("A", "B", "O") for i in hand)
            for prize in combinations(sorted(set(range(9))-set(hand)), 2):
                if not legal:
                    continue
                legal_count += 1
                names = [cards[i] for i in prize]
                b = (names.count("A") + names.count("B")
                     > 1 - names.count("H"))
                n = "N" in names
                basic += b
                nonbasic += n
                either += b or n
        got = combo_prize_cuts((1, 1), (1,), 1, 1,
                               deck_size=9, opening=2, prizes=2)
        self.assertEqual(got["basic_rescue_cut"], Fraction(basic, legal_count))
        self.assertEqual(got["other_role_cut"], Fraction(nonbasic, legal_count))
        self.assertEqual(got["either_cut"], Fraction(either, legal_count))
        self.assertEqual(got["prize_feasible"], 1-Fraction(either, legal_count))

    def test_existing_twin_singleton_crosscheck(self):
        got = combo_prize_cuts((1, 1), (2,), 2, 15)
        self.assertEqual(got['basic_rescue_cut'], Fraction(354201702, 159469254103))

    def test_basic_energy_needed_for_powerglass(self):
        from scripts.new_moon_prize_audit import source_prize_ceiling
        original = source_prize_ceiling()
        required = source_prize_ceiling(
            require_powerglass_basic_energy=True
        )
        self.assertEqual(
            required["either_cut"], Fraction(155146286885, 3414518146676)
        )
        self.assertEqual(
            required["other_role_cut"],
            Fraction(1034314950933, 29877033783415)
        )
        self.assertEqual(
            required["basic_rescue_cut"], original["basic_rescue_cut"]
        )
        self.assertGreater(required["either_cut"], original["either_cut"])

    def test_source_slot_replacements_are_state_conditional(self):
        from scripts.new_moon_prize_sensitivity import compare_swaps
        baseline, rows = compare_swaps()
        by_label = dict(rows)
        self.assertEqual(len(rows), 13)
        self.assertEqual(baseline, Fraction(155146286885, 3414518146676))
        self.assertEqual(
            by_label["third Heavy Ball"],
            Fraction(36213955929103, 1015819148636110)
        )
        self.assertEqual(
            by_label["extra Dusclops"],
            Fraction(76365150945191, 2031638297272220)
        )
        self.assertEqual(
            by_label["extra Lunatone"],
            Fraction(37267972972193, 916331468474240)
        )
        self.assertEqual(
            by_label["extra Basic Psychic Energy"],
            Fraction(206292627407, 4596466735910)
        )
        self.assertTrue(all(value <= baseline for _, value in rows))

    def test_new_moon_source_inventory(self):
        got = combo_prize_cuts((2, 1, 1, 1, 1, 2), (2, 2, 2, 2), 2, 9)
        self.assertEqual(
            got["either_cut"], Fraction(15764333287, 351494515099)
        )
        self.assertEqual(
            got["basic_rescue_cut"], Fraction(22422844919, 2056314066065)
        )
        self.assertEqual(
            got["other_role_cut"], Fraction(53512704543, 1572475462285)
        )


if __name__ == "__main__":
    unittest.main()
