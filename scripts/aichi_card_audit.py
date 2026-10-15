"""Audit Limitless printings against the bundled English card snapshot.

This is a card-data coverage audit, not an Expanded legality ruling.
"""
import json
import os
import tempfile
import unicodedata
from collections import Counter
from pathlib import Path

from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
RESOURCE_DIR = ROOT / "resources"
FIELD_JSON = ROOT / "results" / "aichi-2026" / "full-decklists.json"
AUDIT_JSON = ROOT / "results" / "aichi-2026" / "card-coverage.json"


def normalize(value: str) -> str:
    """Compare names despite harmless capitalization and punctuation differences."""
    return "".join(c for c in unicodedata.normalize("NFKC", value).casefold() if c.isalnum())


def normalize_number(value: str) -> str:
    """Map SM217 or 217 to 217 while preserving numeric suffixes."""
    value = value.upper().strip()
    for prefix in ("SWSH", "SM", "XY", "BW"):
        if value.startswith(prefix) and value[len(prefix):].isdigit():
            value = value[len(prefix):]
            break
    return value.lstrip("0") or "0"


def audit() -> dict:
    source = json.loads(FIELD_JSON.read_text(encoding="utf-8"))
    sets = json.loads((RESOURCE_DIR / "sets" / "en.json").read_text(encoding="utf-8"))
    candidate_sets = {}
    for set_info in sets:
        for code in [set_info["id"].upper(), (set_info.get("ptcgoCode") or "").upper()]:
            if code:
                candidate_sets.setdefault(code, set()).add(set_info["id"])

    catalog = {}
    for set_info in sets:
        file = RESOURCE_DIR / "cards" / "en" / f"{set_info['id']}.json"
        if file.exists():
            catalog[set_info["id"]] = json.loads(file.read_text(encoding="utf-8"))

    findings = []
    totals = Counter()
    weighted = Counter()
    by_deck = []
    for deck in source["decks"]:
        d_counts = Counter()
        for row in deck["cards"]:
            printing = row["printing"]
            set_code = (printing["set"] or "").upper()
            number = str(printing["number"] or "")
            set_ids = candidate_sets.get(set_code, set())
            candidates = [
                card for set_id in set_ids for card in catalog.get(set_id, [])
                if normalize_number(str(card.get("number", ""))) == normalize_number(number)
            ]
            same_name = [card for card in candidates if normalize(card["name"]) == normalize(row["name"])]
            if len(same_name) == 1:
                status = "matched"
            elif len(same_name) > 1:
                status = "ambiguous_printing"
            elif not set_ids:
                status = "set_absent"
            elif not candidates:
                status = "number_absent"
            else:
                status = "name_disagrees"

            totals[status] += 1
            weighted[status] += row["count"]
            d_counts[status] += row["count"]
            if status != "matched":
                findings.append({
                    "rank": deck["rank"],
                    "player": deck["player"],
                    "category": row["category"],
                    "count": row["count"],
                    "name": row["name"],
                    "source_set": set_code,
                    "source_number": number,
                    "status": status,
                    "candidate_names": sorted({card["name"] for card in candidates}),
                    "candidate_ids": sorted({card["id"] for card in candidates}),
                })
        assert sum(d_counts.values()) == 60
        by_deck.append({"rank": deck["rank"], "player": deck["player"], "card_slot_status": dict(d_counts)})

    assert sum(totals.values()) == 989
    assert sum(weighted.values()) == 29 * 60
    return {
        "purpose": "Coverage of bundled English card data against displayed Japanese event printings; not a legality verdict.",
        "original_source": source["source"],
        "deck_count": len(source["decks"]),
        "total_card_rows": sum(totals.values()),
        "total_card_slots": sum(weighted.values()),
        "status_rows": dict(totals),
        "status_card_slots": dict(weighted),
        "by_deck": by_deck,
        "unresolved_rows": findings,
    }


def main() -> None:
    result = audit()
    AUDIT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(f"{AUDIT_JSON}.lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=AUDIT_JSON.parent,
            prefix=".card-coverage-", suffix=".tmp", delete=False
        ) as temp:
            json.dump(result, temp, indent=2, ensure_ascii=False)
            temp.write("\n")
            temporary_path = Path(temp.name)
        os.replace(temporary_path, AUDIT_JSON)
    print("Audit row counts:", result["status_rows"])
    print("Audit physical card slots:", result["status_card_slots"])
    print("Unresolved examples:", result["unresolved_rows"][:10])


if __name__ == "__main__":
    main()
