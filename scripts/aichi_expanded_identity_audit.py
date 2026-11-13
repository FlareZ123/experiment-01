#!/usr/bin/env python3
"""Aichi Top 32 English Expanded card-identity screen.

The Limitless export is an English-normalized display of Japanese-event lists.
This script checks whether each listed identity has an English Expanded-legal
counterpart and whether its English representative set was released by the
event date. It does NOT certify the physical Japanese cards used by players,
and the bundled legalities flags are NOT a substitute for the official banlist.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DECKLISTS = ROOT / "results/aichi-2026/full-decklists.json"
SETS_FILE = ROOT / "resources/sets/en.json"
CARDS_DIR = ROOT / "resources/cards/en"

SET_ID_ALIASES = {"SMP": ("smp",), "XYP": ("xyp",), "BWP": ("bwp",)}
NUMBER_PREFIXES = {"SMP": "SM", "XYP": "XY", "BWP": "BW"}
NAME_ALIASES = {
    "battlecompressor": "battlecompressorteamflaregear",
    "unitenergylpm": "unitenergylightningpsychicmetal",
}
BASIC_ENERGY_NAMES = {
    "grassenergy", "fireenergy", "waterenergy", "lightningenergy",
    "psychicenergy", "fightingenergy", "darknessenergy", "metalenergy",
}
JAPANESE_PRE_EVENT_CROSSWALK = {
    ("specialredcard", "CRI", "82"): {
        "set": "M4",
        "number": "072/083",
        "release_date": "2026-03-13",
        "official_card_url": "https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all",
        "official_product_url": "https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=20&dateUpperM=4&dateUpperY=2026&productType=expansion",
    },
}


def normalize_name(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", ascii_value.lower())


def number_candidates(set_code: str, number: str) -> tuple[str, ...]:
    raw = str(number).strip()
    prefix = NUMBER_PREFIXES.get(str(set_code).upper())
    if prefix and not raw.upper().startswith(prefix):
        return (raw, prefix + raw)
    return (raw,)


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(str(value).replace("/", "-"))


def build_catalog(sets: list[dict[str, Any]], cards_by_set: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    set_to_ids: dict[str, list[str]] = defaultdict(list)
    sets_by_id = {str(item["id"]): item for item in sets if item.get("id")}
    all_cards: list[dict[str, Any]] = []
    for item in sets:
        code = item.get("ptcgoCode")
        set_id = str(item.get("id") or "")
        if code and set_id and set_id not in set_to_ids[str(code)]:
            set_to_ids[str(code)].append(set_id)
    for code, ids in SET_ID_ALIASES.items():
        for set_id in ids:
            if set_id not in set_to_ids[code]:
                set_to_ids[code].append(set_id)
    for set_id, rows in cards_by_set.items():
        for card in rows:
            all_cards.append({**card, "_set_id": set_id})
    return {
        "set_to_ids": dict(set_to_ids),
        "sets_by_id": sets_by_id,
        "cards_by_set": cards_by_set,
        "all_cards": all_cards,
    }


def load_catalog(sets_file: Path = SETS_FILE, cards_dir: Path = CARDS_DIR) -> dict[str, Any]:
    sets = json.loads(sets_file.read_text(encoding="utf-8"))
    cards_by_set: dict[str, list[dict[str, Any]]] = {}
    for path in sorted(cards_dir.glob("*.json")):
        cards_by_set[path.stem] = json.loads(path.read_text(encoding="utf-8"))
    return build_catalog(sets, cards_by_set)


def expanded_flag(card: dict[str, Any]) -> str:
    return str((card.get("legalities") or {}).get("expanded") or "Unknown")


def event_date_status(card: dict[str, Any] | None, set_id: str | None,
                      source_name: str, source_set: str, source_number: str,
                      catalog: dict[str, Any], event_date: date) -> tuple[str, dict[str, Any] | None, str | None]:
    crosswalk = JAPANESE_PRE_EVENT_CROSSWALK.get(
        (normalize_name(source_name), source_set, source_number)
    )
    release = None
    if card and set_id:
        metadata = catalog["sets_by_id"].get(set_id, {})
        release = parse_date(metadata.get("releaseDate"))
    if release is None:
        return "english_release_date_unavailable", crosswalk, None
    if release <= event_date:
        return "english_counterpart_pre_event", crosswalk, release.isoformat()
    if crosswalk and parse_date(crosswalk.get("release_date")) and parse_date(crosswalk["release_date"]) <= event_date:
        return "japanese_counterpart_pre_event_verified", crosswalk, release.isoformat()
    return "english_counterpart_post_event_requires_japanese_crosswalk", crosswalk, release.isoformat()


def audit_entry(entry: dict[str, Any], catalog: dict[str, Any], event_date: date) -> dict[str, Any]:
    name = str(entry.get("name") or "")
    printing = entry.get("printing") or {}
    set_code = str(printing.get("set") or "")
    number = str(printing.get("number") or "")
    count = int(entry.get("count", entry.get("quantity", 1)) or 1)
    name_key = normalize_name(name)
    wanted_name = NAME_ALIASES.get(name_key, name_key)

    if set_code == "MEE" and name_key in BASIC_ENERGY_NAMES:
        return {
            "name": name, "count": count,
            "source_printing": {"set": set_code, "number": number, "display_language": printing.get("language")},
            "status": "basic_energy_identity_legal_printing_unresolved",
            "expanded_legal_identity": True,
            "physical_source_print_verified": False,
            "event_date_status": "not_applicable_basic_energy",
            "matched_english_printing": None,
            "note": "MEE is an export placeholder, not an English set ID; Basic Energy identity is legal, exact print is unresolved.",
        }

    set_ids = catalog["set_to_ids"].get(set_code, [])
    numbers = set(number_candidates(set_code, number))
    number_matches = [
        {**card, "_set_id": set_id}
        for set_id in set_ids
        for card in catalog["cards_by_set"].get(set_id, [])
        if str(card.get("number") or "") in numbers
    ]
    name_matches = [
        card for card in number_matches
        if normalize_name(str(card.get("name") or "")) == wanted_name
    ]

    chosen = None
    status = ""
    if name_matches:
        chosen = next((c for c in name_matches if expanded_flag(c) == "Legal"), name_matches[0])
        flag = expanded_flag(chosen)
        if flag == "Banned":
            status = "expanded_banned"
        elif flag == "Legal":
            exact = (
                name == str(chosen.get("name") or "") and
                number == str(chosen.get("number") or "") and
                set_code not in SET_ID_ALIASES
            )
            status = "english_expanded_legal_exact" if exact else "english_expanded_legal_normalized"
        else:
            status = "expanded_legality_unknown"
    else:
        global_matches = [
            card for card in catalog["all_cards"]
            if normalize_name(str(card.get("name") or "")) == wanted_name
        ]
        legal_global = [c for c in global_matches if expanded_flag(c) == "Legal"]
        banned_global = [c for c in global_matches if expanded_flag(c) == "Banned"]
        if legal_global:
            chosen = legal_global[0]
            status = "english_expanded_legal_identity_source_print_unresolved"
        elif banned_global:
            chosen = banned_global[0]
            status = "expanded_banned"
        elif global_matches:
            chosen = global_matches[0]
            status = "expanded_legality_unknown"
        else:
            status = "no_english_print"

    identity_legal = (
        True if status.startswith("english_expanded_legal") else
        False if status in {"expanded_banned", "no_english_print"} else None
    )
    matched_set_id = chosen.get("_set_id") if chosen else None
    chronology, crosswalk, release_date = event_date_status(
        chosen, matched_set_id, name, set_code, number, catalog, event_date
    )
    matched = None
    if chosen:
        matched = {
            "name": chosen.get("name"),
            "set_id": matched_set_id,
            "number": chosen.get("number"),
            "expanded_flag": expanded_flag(chosen),
            "english_release_date": release_date,
        }
    return {
        "name": name,
        "count": count,
        "source_printing": {"set": set_code, "number": number, "display_language": printing.get("language")},
        "status": status,
        "expanded_legal_identity": identity_legal,
        "physical_source_print_verified": False,
        "event_date_status": chronology,
        "matched_english_printing": matched,
        "japanese_pre_event_crosswalk": crosswalk,
    }


def audit_decks(deck_data: dict[str, Any], catalog: dict[str, Any],
                ranks: set[int] | None = None, event_date: date = date(2026, 5, 10),
                expected_ranks: int = 32) -> dict[str, Any]:
    all_decks = sorted(deck_data.get("decks") or [], key=lambda d: int(d.get("rank", 0)))
    published_ranks = {int(d["rank"]) for d in all_decks}
    selected = [d for d in all_decks if ranks is None or int(d["rank"]) in ranks]
    rank_results = []
    all_card_keys = set()
    for deck in selected:
        cards = [audit_entry(card, catalog, event_date) for card in deck.get("cards", [])]
        copies = sum(card["count"] for card in cards)
        for card in cards:
            p = card["source_printing"]
            all_card_keys.add((card["name"], p["set"], p["number"]))
        unresolved = [
            card for card in cards
            if card["expanded_legal_identity"] is not True or
            card["event_date_status"] == "english_counterpart_post_event_requires_japanese_crosswalk"
        ]
        status = "expanded_identity_screen_pass" if copies == 60 and not unresolved else "needs_review"
        rank_results.append({
            "rank": int(deck["rank"]),
            "player": deck.get("player"),
            "archetype": deck.get("archetype"),
            "card_rows": len(cards),
            "card_copies": copies,
            "unique_source_rows": len({(c["name"], c["source_printing"]["set"], c["source_printing"]["number"]) for c in cards}),
            "expanded_identity_status": status,
            "physical_source_print_status": "unverified",
            "unresolved_rows": unresolved,
            "cards": cards,
        })
    status_counts = Counter(r["expanded_identity_status"] for r in rank_results)
    return {
        "schema": "aichi-expanded-identity-screen-v1",
        "event_date": event_date.isoformat(),
        "decklist_source": {
            "source": deck_data.get("source"),
            "source_url": deck_data.get("source_url"),
            "retrieved_at_utc": deck_data.get("retrieved_at_utc"),
        },
        "card_pool": {
            "scope": "English-only bundled card snapshot",
            "set_count": len(catalog["sets_by_id"]),
            "card_record_count": len(catalog["all_cards"]),
            "authority_note": "Card-pool expanded flags are a snapshot cross-check, not the current official banned-printing authority.",
        },
        "field_inventory": {
            "published_deck_count": len(all_decks),
            "expected_top32_ranks": expected_ranks,
            "missing_ranks": sorted(set(range(1, expected_ranks + 1)) - published_ranks),
        },
        "selection": sorted(ranks) if ranks is not None else "all-published-ranks",
        "summary": {
            "selected_deck_count": len(rank_results),
            "card_rows": sum(r["card_rows"] for r in rank_results),
            "card_copies": sum(r["card_copies"] for r in rank_results),
            "unique_source_rows": len(all_card_keys),
            "rank_status_counts": dict(sorted(status_counts.items())),
        },
        "official_banlist_overlay": {
            "status": "cross-reference-required",
            "report": "results/aichi-2026/2026-11/agent3-expanded-banlist-snapshot-discrepancy-20261113.md",
        },
        "physical_print_limit": "The Limitless export is an English display/identity normalization; it does not authenticate the physical Japanese print used by each player.",
        "ranks": rank_results,
    }


def parse_ranks(value: str | None) -> set[int] | None:
    if not value:
        return None
    return {int(part.strip()) for part in value.split(",") if part.strip()}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--decklists", type=Path, default=DECKLISTS)
    parser.add_argument("--sets", type=Path, default=SETS_FILE)
    parser.add_argument("--cards-dir", type=Path, default=CARDS_DIR)
    parser.add_argument("--ranks", help="Comma-separated Aichi ranks; default audits all published lists")
    parser.add_argument("--event-date", default="2026-05-10")
    parser.add_argument("--output", type=Path, help="Write JSON to this path instead of stdout")
    args = parser.parse_args()

    deck_data = json.loads(args.decklists.read_text(encoding="utf-8"))
    catalog = load_catalog(args.sets, args.cards_dir)
    result = audit_decks(deck_data, catalog, parse_ranks(args.ranks), parse_date(args.event_date))
    rendered = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    else:
        sys.stdout.write(rendered)
    failed = [r["rank"] for r in result["ranks"] if r["expanded_identity_status"] != "expanded_identity_screen_pass"]
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
