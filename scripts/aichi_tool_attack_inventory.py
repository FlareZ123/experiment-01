"""Source-printing audit of attack-granting Tools in Aichi 2026 Top32 lists.

Uses the bundled English card snapshot and printed set/number pairs. Missing
regional cards remain unresolved; this is an attack-source audit, not an
Expanded legality or competitive policy certificate.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Callable, Any
import unicodedata


def normalize(value: str) -> str:
    """Match harmless source printing name punctuation and capitalization."""
    return "".join(
        char for char in unicodedata.normalize("NFKC", value).casefold()
        if char.isalnum()
    )


def normalize_number(value: str) -> str:
    """Normalize collector number prefixes consistently with source audits."""
    value = value.upper().strip()
    for prefix in ("SWSH", "SM", "XY", "BW"):
        if value.startswith(prefix) and value[len(prefix):].isdigit():
            value = value[len(prefix):]
            break
    return value.lstrip("0") or "0"

ROOT = Path(__file__).resolve().parents[1]


def build_printing_resolver(root: Path) -> Callable[[dict], dict | None]:
    """Require a unique exact-set, collector-number and normalized-name match."""
    sets = json.loads((root / "resources/sets/en.json").read_text(encoding="utf-8"))
    aliases: dict[str, set[str]] = {}
    for item in sets:
        for alias in (item.get("id"), item.get("ptcgoCode")):
            if alias:
                aliases.setdefault(alias.upper(), set()).add(item["id"])

    @lru_cache(maxsize=None)
    def cards_in_set(set_id: str) -> tuple[dict, ...]:
        filename = root / "resources/cards/en" / f"{set_id}.json"
        return tuple(json.loads(filename.read_text(encoding="utf-8"))) if filename.is_file() else ()

    def resolve(row: dict) -> dict | None:
        printing = row["printing"]
        source_number = normalize_number(str(printing["number"]))
        candidates = [
            card
            for set_id in aliases.get(str(printing["set"]).upper(), ())
            for card in cards_in_set(set_id)
            if normalize_number(str(card.get("number", ""))) == source_number
            and normalize(card["name"]) == normalize(row["name"])
        ]
        return candidates[0] if len(candidates) == 1 else None

    return resolve


def audit_tool_attacks(
    decks: list[dict], resolve: Callable[[dict], dict | None]
) -> dict[str, Any]:
    """Inventory verified printed Trainer-Tool attacks across complete source lists."""
    if len({deck["rank"] for deck in decks}) != len(decks):
        raise ValueError("Duplicate published rank")
    matches = []
    unresolved = []
    for deck in decks:
        if sum(row["count"] for row in deck["cards"]) != 60:
            raise ValueError(f"Rank {deck['rank']} is not a 60-card source list")
        for row in deck["cards"]:
            if row["category"] != "Trainer":
                continue
            card = resolve(row)
            if card is None:
                unresolved.append({
                    "rank": deck["rank"], "name": row["name"],
                    "printing": row["printing"], "copies": row["count"]
                })
                continue
            if card.get("supertype") != "Trainer":
                raise ValueError(f"Resolved Trainer as another category: {row['name']}")
            if "Pokémon Tool" not in card.get("subtypes", ()):
                continue
            attacks = card.get("attacks") or []
            if not attacks:
                continue
            matches.append({
                "rank": deck["rank"],
                "archetype": deck["archetype"],
                "name": row["name"],
                "printing": row["printing"],
                "copies": row["count"],
                "attacks": [{
                    "name": attack["name"],
                    "cost": attack.get("cost", []),
                    "damage": attack.get("damage", ""),
                    "text": attack.get("text", "")
                } for attack in attacks]
            })
    known_ranks = sorted({entry["rank"] for entry in matches})
    return {
        "kind": "aichi-exact-printing-tool-attack-inventory-v1",
        "publishedDecks": len(decks),
        "confirmedAttackProvidingToolCopies": sum(x["copies"] for x in matches),
        "knownRanksWithToolAttacks": known_ranks,
        "knownRankCount": len(known_ranks),
        "matches": matches,
        "unresolvedTrainerRows": unresolved,
        "scope": (
            "Only uniquely matched English-snapshot Trainer Tool printings with "
            "an explicit attacks array are counted. Unresolved regional rows and "
            "other attack-granting effects are not inferred; no gameplay, legality "
            "or win-rate claims."
        )
    }


def main() -> None:
    lists = json.loads(
        (ROOT / "results/aichi-2026/full-decklists.json").read_text(encoding="utf-8")
    )
    outcome = audit_tool_attacks(lists["decks"], build_printing_resolver(ROOT))
    print(json.dumps(outcome, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
