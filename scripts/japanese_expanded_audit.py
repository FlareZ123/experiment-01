"""Scoped Japanese Expanded banned-identity audit for Aichi 10 May 2026.

The official Japanese page lists specific Pokémon *identities*, not every
printing sharing a Pokémon's name. English card metadata is only a translation
proxy, and a passed ban audit does not prove full regional legality.
"""
from __future__ import annotations

import json
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANLIST = ROOT / "results" / "legality" / "japan-expanded-aichi-2026.json"
MANIFEST = ROOT / "results" / "aichi-2026" / "full-decklists.json"


def normalized_name(value: str) -> str:
    """Normalize accent and punctuation for English display comparisons."""
    text = unicodedata.normalize("NFKD", value).casefold()
    return "".join(char for char in text if char.isalnum())


def normalized_number(value: str) -> str:
    text = str(value).upper().strip()
    for prefix in ("SWSH", "SM", "XY", "BW"):
        if text.startswith(prefix) and text[len(prefix):].isdigit():
            text = text[len(prefix):]
            break
    return text.lstrip("0") or "0"


def load_english_index(root: Path = ROOT) -> dict[tuple[str, str], list[dict]]:
    """Map Limitless source set abbreviation and number to card objects."""
    sets = json.loads((root / "resources" / "sets" / "en.json").read_text(encoding="utf-8"))
    by_code: dict[str, set[str]] = {}
    by_id: dict[str, list[dict]] = {}
    for info in sets:
        set_id = info["id"]
        path = root / "resources" / "cards" / "en" / f"{set_id}.json"
        if path.exists():
            by_id[set_id] = json.loads(path.read_text(encoding="utf-8"))
        for code in (set_id, info.get("ptcgoCode") or ""):
            if code:
                by_code.setdefault(code.upper(), set()).add(set_id)
    index: dict[tuple[str, str], list[dict]] = {}
    for code, ids in by_code.items():
        for set_id in ids:
            for card in by_id.get(set_id, []):
                key = code, normalized_number(card.get("number", ""))
                index.setdefault(key, []).append(card)
    return index


def classify_card(row: dict, english_index: dict, banned: list[dict]) -> dict:
    """Classify only explicit bans, preserving unresolved name collisions."""
    rules = [rule for rule in banned
             if normalized_name(rule["english_name"]) == normalized_name(row["name"])]
    if not rules:
        return {"status": "no-listed-ban-name"}

    trainer_rules = [rule for rule in rules if rule["selector"]["type"] == "trainer_name"]
    if trainer_rules:
        return {"status": "banned", "ban_identity": trainer_rules[0]["english_name"]}

    name_rules = [rule for rule in rules if rule["selector"]["type"] == "pokemon_name"]
    if name_rules:
        return {"status": "banned", "ban_identity": name_rules[0]["english_name"]}

    printing = row["printing"]
    cards = english_index.get((
        str(printing["set"]).upper(), normalized_number(printing["number"])
    ), [])
    matching = [card for card in cards
                if normalized_name(card["name"]) == normalized_name(row["name"])]
    if len(matching) != 1:
        return {"status": "indeterminate-identity", "candidate_card_ids":
                [card.get("id") for card in matching]}

    card = matching[0]
    for rule in rules:
        selector = rule["selector"]
        if selector["type"] == "ability":
            matches = any(a.get("name") == selector["value"] for a in card.get("abilities", []))
        elif selector["type"] == "attack":
            matches = any(a.get("name") == selector["value"] for a in card.get("attacks", []))
        else:
            raise ValueError("Unknown ban identity selector")
        if matches:
            return {"status": "banned", "ban_identity": rule["english_name"],
                    "english_card_id": card["id"], "trait": selector["value"]}
    return {"status": "different-identity", "english_card_id": card["id"]}


def audit(manifest: dict, ban_data: dict, english_index: dict) -> dict:
    rules = ban_data["banned_identities"]
    counts: Counter[str] = Counter()
    card_slots: Counter[str] = Counter()
    observations = []
    conflicts = []
    exclusive_supporter_families = (
        {"Professor Juniper", "Professor Sycamore", "Professor's Research"},
        {"Lysandre", "Boss's Orders"},
    )

    for deck in manifest["decks"]:
        if sum(row["count"] for row in deck["cards"]) != 60:
            raise ValueError(f"Non-60-card source deck: rank {deck['rank']}")
        names = {normalized_name(row["name"]) for row in deck["cards"]}
        for family in exclusive_supporter_families:
            used = sorted(n for n in family if normalized_name(n) in names)
            if len(used) > 1:
                conflicts.append({"rank": deck["rank"], "mutually_exclusive": used})
        for row in deck["cards"]:
            found = classify_card(row, english_index, rules)
            counts[found["status"]] += 1
            card_slots[found["status"]] += row["count"]
            if found["status"] != "no-listed-ban-name":
                observations.append({
                    "rank": deck["rank"], "source_name": row["name"],
                    "source_printing": row["printing"], "count": row["count"], **found
                })
    return {
        "source": ban_data["source_url"],
        "event_date": ban_data["valid_for_event"],
        "scope": "Japanese banned-identities versus English-display printings only; NOT full legality",
        "decks_audited": len(manifest["decks"]),
        "status_rows": dict(counts),
        "status_slots": dict(card_slots),
        "exclusive_supporter_conflicts": conflicts,
        "listed_name_observations": observations,
    }


def audit_repository(root: Path = ROOT) -> dict:
    ban_data = json.loads((root / "results" / "legality" /
                           "japan-expanded-aichi-2026.json").read_text(encoding="utf-8"))
    manifest = json.loads((root / "results" / "aichi-2026" /
                           "full-decklists.json").read_text(encoding="utf-8"))
    return audit(manifest, ban_data, load_english_index(root))


if __name__ == "__main__":
    report = audit_repository()
    print(json.dumps(report, ensure_ascii=False, indent=2))
