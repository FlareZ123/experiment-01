#!/usr/bin/env python3
"""Enumerate Expanded-legal Pokémon Abilities that restrict attacks or retreat."""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

LOCK = re.compile(
    r"can't attack|cannot attack|can.t use.{0,30}attack|cannot use.{0,30}attack|"
    r"can't retreat|cannot retreat|can.t use.{0,30}retreat|cannot use.{0,30}retreat",
    re.IGNORECASE,
)


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
            if card.get("supertype") != "Pokémon":
                continue
            if card.get("legalities", {}).get("expanded") != "Legal":
                continue
            for ability in card.get("abilities", []) or []:
                text = ability.get("text", "")
                if not LOCK.search(text):
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
            "scope_hint": "opponent-facing" if "opponent" in text.lower() else "self-or-global",
            "printings": sorted(
                printings,
                key=lambda p: (p["set_file"], str(p["number"])),
            ),
        })
    print(json.dumps({
        "expanded_legal_unique_lock_texts": len(rows),
        "expanded_legal_printings": sum(len(r["printings"]) for r in rows),
        "rows": rows,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
