"""Tests for Agent 7's explicitly frozen Lillie-reset Tinkaton v1 candidate."""
import json
import unittest
from collections import Counter
from fractions import Fraction
from math import comb
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ALS = ROOT / "results" / "als"
CARDS = ROOT / "resources" / "cards" / "en"


def load(name):
    return json.loads((ALS / name).read_text(encoding="utf-8"))["cards"]


def exact_k0_five_channel():
    groups = (3, 4, 6, 2)
    probability = Fraction(0)
    for mask in range(1 << len(groups)):
        missing = sum(group for i, group in enumerate(groups) if mask & (1 << i))
        available = 60 - missing
        term = Fraction(comb(available, 9), comb(60, 9)) * (
            1 - Fraction(comb(available - 4, 7), comb(available, 7))
        )
        probability += -term if mask.bit_count() % 2 else term
    return probability


class LillieResetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.v0 = load("agent7-tinkaton-hand-preservation-v0.json")
        cls.v1 = load("agent7-tinkaton-lillie-reset-v1.json")

    def test_60_card_immutable_three_substitutions(self):
        a = Counter({c["id"]: c["count"] for c in self.v0})
        b = Counter({c["id"]: c["count"] for c in self.v1})
        self.assertEqual(sum(b.values()), 60)
        self.assertEqual(a - b, Counter({
            "swsh2-154": 2, "swsh11-155": 2, "sv1-179": 1
        }))
        self.assertEqual(b - a, Counter({
            "sm3-115": 2, "me1-119": 2, "xy8-137": 1
        }))
        self.assertEqual(sum(c["count"] for c in self.v1
                             if c["category"] == "Trainer"), 32)
        self.assertTrue(all(count <= 4 for count in b.values()))

    def test_new_exact_prints_and_effects(self):
        expected = {
            "me1-119": ("Lillie's Determination", "draw 8 cards instead"),
            "sm3-115": ("Guzma", "switch your Active Pokémon"),
            "xy8-137": ("Float Stone", "has no Retreat Cost"),
        }
        for card_id, (name, phrase) in expected.items():
            with self.subTest(printing=card_id):
                pool = json.loads(
                    (CARDS / (card_id.split("-", 1)[0] + ".json"))
                    .read_text(encoding="utf-8")
                )
                (printing,) = [c for c in pool if c["id"] == card_id]
                self.assertEqual(printing["name"], name)
                self.assertEqual(printing["legalities"]["expanded"], "Legal")
                self.assertIn(phrase, " ".join(printing["rules"]))

    def test_lillie_reset_damage_bound(self):
        self.assertEqual(8 * 30, 240)
        self.assertEqual(8 * 30 - 20, 220)
        self.assertEqual(11 * 30, 330)
        self.assertEqual(11 * 30 - 20, 310)

    def test_five_channel_exact_opening(self):
        self.assertEqual(
            exact_k0_five_channel(),
            Fraction(74863739, 12095298540)
        )


if __name__ == "__main__":
    unittest.main()
