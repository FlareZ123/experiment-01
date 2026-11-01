"""Synthetic rejection and positive tests for the frozen rank-6 screen."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from agent22_original_rank6_volt_damage_prize import check_transition, prize_value


def scenario(name, hp, before_damage, after_damage, before_prizes=6,
             after_prizes=6, subtypes=(), weaknesses=(), resistances=()):
    defender = {"name": name, "hp": str(hp), "subtypes": list(subtypes),
                "weaknesses": list(weaknesses), "resistances": list(resistances)}
    before = {"name": name, "damage": before_damage}
    after = None if after_damage is None else {"name": name, "damage": after_damage}
    attack = {
        "publicBoardBefore": [{"active": before}, {"active": {"name": "Iron Thorns ex"}}],
        "publicBoardAfter": [{"active": after}, {"active": {"name": "Iron Thorns ex"}}],
        "prizesBefore": [6, before_prizes],
        "prizesAfter": [6, after_prizes],
    }
    return attack, defender


class OriginalRank6VoltPrintedTests(unittest.TestCase):
    def test_defender_survives_with_exact_140(self):
        attack, card = scenario("Defender", 230, 0, 140)
        self.assertEqual(check_transition(attack, 1, card), "survived-140")

    def test_regular_ko_one_prize(self):
        attack, card = scenario("Defender", 90, 0, None, after_prizes=5)
        self.assertEqual(check_transition(attack, 1, card), "ko-prize-1")

    def test_tag_team_gx_three_prizes(self):
        attack, card = scenario("Tag Team", 240, 140, None,
                                after_prizes=3, subtypes=("Basic", "TAG TEAM", "GX"))
        self.assertEqual(prize_value(card), 3)
        self.assertEqual(check_transition(attack, 1, card), "ko-prize-3")

    def test_prize_cap_when_only_two_remaining(self):
        attack, card = scenario("Tag Team", 240, 140, None, before_prizes=2,
                                after_prizes=0, subtypes=("Basic", "TAG TEAM", "GX"))
        self.assertEqual(check_transition(attack, 1, card), "ko-prize-2")

    def test_wrong_130_damage_is_rejected(self):
        attack, card = scenario("Defender", 230, 0, 130)
        with self.assertRaisesRegex(ValueError, "140 damage"):
            check_transition(attack, 1, card)

    def test_ko_below_hp_threshold_is_rejected(self):
        attack, card = scenario("Defender", 230, 0, None, after_prizes=5)
        with self.assertRaisesRegex(ValueError, "HP/KO threshold"):
            check_transition(attack, 1, card)

    def test_wrong_prize_award_is_rejected(self):
        attack, card = scenario("Defender", 90, 0, None, after_prizes=4)
        with self.assertRaisesRegex(ValueError, "Prize award"):
            check_transition(attack, 1, card)

    def test_unmodeled_lightning_weakness_is_rejected(self):
        attack, card = scenario("Defender", 230, 0, 140,
                                weaknesses=({"type": "Lightning", "value": "×2"},))
        with self.assertRaisesRegex(ValueError, "unmodeled"):
            check_transition(attack, 1, card)


if __name__ == "__main__":
    unittest.main()
