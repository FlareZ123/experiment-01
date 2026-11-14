#!/usr/bin/env python3
"""Enumerate Expanded-legal Stadiums with potentially strategic board effects.

The keyword scan is intentionally broad. It is a policy-review inventory,
not a rules interpreter: every listed Stadium must be classified by effect
scope and state before a decision policy treats it as relevant or harmless.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

KEYWORDS = {
    "weakness": re.compile(r"weakness", re.IGNORECASE),
    "damage": re.compile(r"damage", re.IGNORECASE),
    "prize": re.compile(r"prize", re.IGNORECASE),
    "attack": re.compile(r"attack", re.IGNORECASE),
    "retreat": re.compile(r"retreat", re.IGNORECASE),
    "cost": re.compile(r"cost", re.IGNORECASE),
    "prevent": re.compile(r"prevent", re.IGNORECASE),
    "reduce": re.compile(r"reduce", re.IGNORECASE),
}


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
            if card.get("supertype") != "Trainer":
                continue
            if "Stadium" not in (card.get("subtypes") or []):
                continue
            if card.get("legalities", {}).get("expanded") != "Legal":
                continue
            text = " ".join(card.get("rules", []) or [])
            matched = [name for name, pattern in KEYWORDS.items()
                       if pattern.search(text)]
            if not matched:
                continue
            key = (card.get("name", ""), text)
            grouped[key].append({
                "set_file": path.name,
                "id": card.get("id"),
                "number": card.get("number"),
                "matched_effect_terms": matched,
            })
    rows = []
    for (name, text), printings in sorted(grouped.items()):
        rows.append({
            "name": name,
            "text": text,
            "matched_effect_terms": sorted({
                term for p in printings for term in p["matched_effect_terms"]
            }),
            "printings": sorted(
                printings,
                key=lambda p: (p["set_file"], str(p["number"])),
            ),
        })
    print(json.dumps({
        "expanded_legal_unique_stadium_texts": len(rows),
        "expanded_legal_printings": sum(len(r["printings"]) for r in rows),
        "rows": rows,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
