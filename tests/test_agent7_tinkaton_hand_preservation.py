"""Bounded exact-math and card-printing checks for Agent 7's Tinkaton candidate.

Tests assert an exploratory 60-card paper Expanded screen. They do not validate
Japanese legality, live decision policy, game outcomes or win rates.
"""

import json
import unittest
from collections import Counter
from fractions import Fraction
from math import comb
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DECK_PATH = ROOT / "results" / "als" / "agent7-tinkaton-hand-preservation-v0.json"
CARD_DIR = ROOT / "resources" / "cards" / "en"


def exact_direct_opening(cards):
    """Opening Tinkatink, plus ex/Candy/double Energy among first nine."""
    counts = Counter()
    for entry in cards:
        counts[entry["id"]] += entry["count"]
    opener = counts["sv2-102"]
    categories = (counts["svp-31"], counts["sv1-191"],
                  counts["sm1-136"] + counts["swsh9-151"])
    total = sum(counts.values())
    denominator = comb(total, 9)
    probability = Fraction(0)
    for mask in range(1 << len(categories)):
        missing = sum(n for i, n in enumerate(categories) if mask & (1 << i))
        remaining = total - missing
        no_opener = Fraction(comb(remaining - opener, 7), comb(remaining, 7))
        term = Fraction(comb(remaining, 9), denominator) * (1 - no_opener)
        probability += -term if mask.bit_count() % 2 else term
    return probability


class Agent7TinkatonHandPreservationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.deck = json.loads(DECK_PATH.read_text(encoding="utf-8"))
        cls.cards = cls.deck["cards"]

    def test_fixed_60_and_four_copy_rule(self):
        self.assertEqual(sum(c["count"] for c in self.cards), 60)
        groups = Counter()
        names = Counter()
        for entry in self.cards:
            self.assertGreater(entry["count"], 0)
            groups[entry["category"]] += entry["count"]
            if entry["id"] != "sm1-162":
                names[entry["name"]] += entry["count"]
        self.assertEqual(groups, {"Pokémon": 20, "Trainer": 32, "Energy": 8})
        self.assertTrue(all(n <= 4 for n in names.values()))
        self.assertEqual(len({c["id"] for c in self.cards}), len(self.cards))

    def test_exact_prints_and_english_expanded_legality(self):
        for entry in self.cards:
            with self.subTest(printing=entry["id"]):
                set_id = entry["id"].split("-", 1)[0]
                card_pool = json.loads(
                    (CARD_DIR / (set_id + ".json")).read_text(encoding="utf-8")
                )
                matches = [c for c in card_pool if c["id"] == entry["id"]]
                self.assertEqual(len(matches), 1)
                printed = matches[0]
                self.assertEqual(printed["name"], entry["name"])
                self.assertEqual(printed["supertype"], entry["category"])
                self.assertEqual(printed["legalities"]["expanded"], "Legal")

    def test_necessary_printed_attack_and_ability_text(self):
        target = {c["id"]: c for c in self.cards}
        self.assertEqual(target["svp-31"]["count"], 3)
        def source(card_id):
            raw = json.loads(
                (CARD_DIR / (card_id.split("-", 1)[0] + ".json"))
                .read_text(encoding="utf-8")
            )
            return next(c for c in raw if c["id"] == card_id)
        tinkaton = source("svp-31")
        attacks = {a["name"]: a["text"] for a in tinkaton["attacks"]}
        self.assertIn("30 damage for each card in your hand", attacks["Big Hammer"])
        self.assertIn("isn't affected by any effects", attacks["Pulverizing Press"])
        dudunsparce = source("sv5-129")
        abilities = {a["name"]: a["text"] for a in dudunsparce["abilities"]}
        self.assertIn("draw 3 cards", abilities["Run Away Draw"])
        self.assertIn("shuffle this Pokémon", abilities["Run Away Draw"])

    def test_restricted_first_nine_exact_fraction(self):
        self.assertEqual(
            exact_direct_opening(self.cards),
            Fraction(785901383, 24190597080)
        )
        basic_count = 11
        valid = 1 - Fraction(comb(60-basic_count, 7), comb(60, 7))
        self.assertAlmostEqual(float(valid), 0.7775788585041408)
        self.assertAlmostEqual(
            float(exact_direct_opening(self.cards) / valid),
            0.04178082594
        )


if __name__ == "__main__":
    unittest.main()
