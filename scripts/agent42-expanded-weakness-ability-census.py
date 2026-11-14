#!/usr/bin/env python3
"""Enumerate Expanded-legal Pokémon Abilities mentioning Weakness but not damage/prizes.

This is a fail-closed policy-support census, not a rules adjudicator. It identifies
printed Ability text that a damage/Weakness projection should not silently ignore.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

WEAKNESS = re.compile(r"weakness", re.IGNORECASE)
ALREADY_CAUGHT = re.compile(r"damage|prize", re.IGNORECASE)


def load_cards(path: Path):
    raw = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, dict):
        raw = raw.get("cards", raw.values())
    if isinstance(raw, dict):
        raw = raw.values()
    return raw


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "cards_dir", nargs="?", type=Path,
        default=Path("resources/cards/en"),
        help="directory containing the English card JSON files",
    )
    args = parser.parse_args()
    grouped = defaultdict(list)
    for path in sorted(args.cards_dir.glob("*.json")):
        for card in load_cards(path):
            if not isinstance(card, dict):
                continue
            if card.get("legalities", {}).get("expanded") != "Legal":
                continue
            for ability in card.get("abilities", []) or []:
                text = ability.get("text", "")
                if not WEAKNESS.search(text) or ALREADY_CAUGHT.search(text):
                    continue
                key = (card.get("name", ""), ability.get("name", ""), text)
                grouped[key].append({
                    "set_file": path.name,
                    "id": card.get("id"),
                    "number": card.get("number"),
                    "types": card.get("types", []),
                })
    rows = []
    for (name, ability, text), printings in sorted(grouped.items()):
        rows.append({
            "name": name,
            "ability": ability,
            "text": text,
            "printings": sorted(
                printings,
                key=lambda p: (p["set_file"], str(p["number"])),
            ),
        })
    print(json.dumps({
        "expanded_legal_unique_ability_texts": len(rows),
        "expanded_legal_printings": sum(len(r["printings"]) for r in rows),
        "rows": rows,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
