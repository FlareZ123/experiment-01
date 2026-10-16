"""Regression coverage for exact source-printing attack-providing Tool inventory."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from aichi_tool_attack_inventory import audit_tool_attacks, build_printing_resolver


def deck(rank: int, trainer_name: str, trainer_count: int) -> dict:
    return {
        "rank": rank,
        "archetype": f"Demo {rank}",
        "cards": [
            {
                "category": "Trainer", "name": trainer_name, "count": trainer_count,
                "printing": {"set": "PAR", "number": "178"}
            },
            {
                "category": "Pokémon", "name": "Basic", "count": 60 - trainer_count,
                "printing": {"set": "BASIC", "number": "1"}
            }
        ]
    }


class ToolAttackInventoryTests(unittest.TestCase):
    def test_source_printings_count_copies_and_ranks(self) -> None:
        def resolve(row: dict) -> dict | None:
            if row["name"] == "Technical Machine: Evolution":
                return {
                    "name": row["name"], "supertype": "Trainer",
                    "subtypes": ["Pokémon Tool"],
                    "attacks": [{"name": "Evolution", "cost": ["Colorless"], "damage": ""}]
                }
            if row["name"] == "Float Stone":
                return {"name": row["name"], "supertype": "Trainer",
                        "subtypes": ["Pokémon Tool"]}
            return None

        result = audit_tool_attacks([
            deck(2, "Technical Machine: Evolution", 2),
            deck(15, "Technical Machine: Evolution", 2),
            deck(26, "Float Stone", 4),
            deck(31, "Unresolved Tool", 1)
        ], resolve)
        self.assertEqual(result["publishedDecks"], 4)
        self.assertEqual(result["confirmedAttackProvidingToolCopies"], 4)
        self.assertEqual(result["knownRanksWithToolAttacks"], [2, 15])
        self.assertEqual(len(result["matches"]), 2)
        self.assertEqual(len(result["unresolvedTrainerRows"]), 1)
        self.assertFalse("winRate" in result)

    def test_duplicate_ranks_and_wrong_deck_size_fail_closed(self) -> None:
        self.assertRaises(ValueError, audit_tool_attacks,
                          [deck(2, "TM", 2), deck(2, "TM", 2)], lambda _: None)
        wrong = deck(2, "TM", 2)
        wrong["cards"][1]["count"] = 57
        self.assertRaises(ValueError, audit_tool_attacks, [wrong], lambda _: None)

    def test_resolver_uses_set_number_and_normalized_name(self) -> None:
        with tempfile.TemporaryDirectory() as location:
            root = Path(location)
            (root / "resources/sets").mkdir(parents=True)
            (root / "resources/cards/en").mkdir(parents=True)
            (root / "resources/sets/en.json").write_text(
                json.dumps([{"id": "sv4", "ptcgoCode": "PAR"}]), encoding="utf-8")
            (root / "resources/cards/en/sv4.json").write_text(json.dumps([
                {
                    "id": "sv4-178", "name": "Technical Machine: Evolution",
                    "number": "178", "supertype": "Trainer",
                    "subtypes": ["Pokémon Tool"],
                    "attacks": [{"name": "Evolution", "cost": ["Colorless"]}]
                }
            ]), encoding="utf-8")
            resolve = build_printing_resolver(root)
            row = {
                "name": "technical machine evolution",
                "printing": {"set": "PAR", "number": "0178"}
            }
            self.assertEqual(resolve(row)["id"], "sv4-178")
            row["printing"]["number"] = "177"
            self.assertIsNone(resolve(row))
            row["printing"]["number"] = "178"
            row["name"] = "Technical Machine: Crisis Punch"
            self.assertIsNone(resolve(row))


if __name__ == "__main__":
    unittest.main()
