"""Capture an unassigned Aichi 2026 Top-32 poster's publicly published saved deck.

The first-person article supplies an official Pokémon deck code but not a verified
legal-name-to-final-rank identity. Preserve the exact Japanese card IDs and
60-card counts as source evidence without inserting them in the ranked field.
"""
from __future__ import annotations

import hashlib
import html
import json
import os
import re
import tempfile
from pathlib import Path

import requests
from filelock import FileLock

# Keep this narrow and source-auditable. No guessing codes or scanning accounts.
PUBLIC_SOURCES = {
    "itoko": {
        "code": "ySpy2S-Ey5WAe-RX3Rpp",
        "source_article": "https://note.com/itoko_/n/n0758eccdf029",
        "poster": "いとこ / @itoko_pokemon",
        "rank_authentication": False,
        "source_report": "2026-05-10 Aichi Open League Top32, Swiss 7-1, round-of-32 loss",
    },
}
SECTIONS = (
    "deck_pke", "deck_gds", "deck_tool", "deck_tech",
    "deck_sup", "deck_sta", "deck_ene", "deck_ajs",
)
OUTPUT = Path("results/aichi-2026/public-top32-saved-deck-capture")


def parse_saved_deck(raw: bytes, source_key: str) -> dict:
    """Extract the real saved-deck viewer's printed IDs and physical copy counts."""
    source = PUBLIC_SOURCES[source_key]
    code = source["code"]
    page = raw.decode("utf-8")
    if code not in page or "60枚デッキ" not in page:
        raise ValueError("Official saved-deck code or sixty-card marker missing")

    names = {
        int(card_id): html.unescape(name)
        for card_id, name in re.findall(
            r"PCGDECK\.searchItemName\[(\d+)\]='([^']+)';", page
        )
    }
    pictures = {
        int(card_id): picture
        for card_id, picture in re.findall(
            r"PCGDECK\.searchItemCardPict\[(\d+)\]='([^']+)';", page
        )
    }
    if not names or not pictures:
        raise ValueError("Official viewer lacks source printing dictionaries")

    entries = []
    for section in SECTIONS:
        match = re.search(
            'name="' + section + '" id="' + section + '" value="([^"]*)"',
            page,
        )
        if match is None:
            raise ValueError("Official viewer lacks required section " + section)
        for slot in filter(None, match.group(1).split("-")):
            parts = slot.split("_")
            if len(parts) != 3:
                raise ValueError("Malformed official card slot " + slot)
            official_id, copies, variant = map(int, parts)
            if official_id not in names or official_id not in pictures or copies < 1:
                raise ValueError("Incomplete printed card reference " + slot)
            edition = re.search(r"/large/([^/]+)/", pictures[official_id])
            if edition is None:
                raise ValueError("Missing Japanese printed set " + slot)
            raw_name = names[official_id]
            japanese_name = raw_name.rpartition("(")[0] or raw_name
            entries.append({
                "section": section,
                "japanese_name": japanese_name,
                "official_print_label": raw_name,
                "japanese_card_id": official_id,
                "japanese_set": edition.group(1),
                "quantity": copies,
                "variant": variant,
            })

    printed_ids = [entry["japanese_card_id"] for entry in entries]
    if len(printed_ids) != len(set(printed_ids)):
        raise ValueError("Official printed card ID repeated across sections")
    if sum(entry["quantity"] for entry in entries) != 60:
        raise ValueError("Official saved-deck physical slots do not total sixty")

    group_counts = {
        "pokemon": sum(e["quantity"] for e in entries if e["section"] == "deck_pke"),
        "trainer": sum(e["quantity"] for e in entries
                       if e["section"] not in ("deck_pke", "deck_ene")),
        "energy": sum(e["quantity"] for e in entries if e["section"] == "deck_ene"),
    }
    return {
        "schema": "aichi-unassigned-top32-public-code-japanese-print-v1",
        "source_key": source_key,
        "poster": source["poster"],
        "source_article": source["source_article"],
        "published_code": code,
        "official_saved_deck_url":
            f"https://www.pokemon-card.com/deck/confirm.html/deckID/{code}/",
        "published_event_context": source["source_report"],
        "source_html_sha256": hashlib.sha256(raw).hexdigest(),
        "retrieved_from_official_saved_deck_viewer": True,
        "official_event_registered_identity_authenticated": False,
        "source_rank_authenticated": False,
        "official_saved_deck_equals_event_registration_authenticated": False,
        "full_printing_level_card_legality_verified": False,
        "competitive_game_results": 0,
        "field_source_approved": False,
        "japanese_printing_rows": len(entries),
        "total_physical_copies": 60,
        "category_counts": group_counts,
        "entries": entries,
    }


def archive(raw: bytes, result: dict, target: Path) -> None:
    """Preserve raw HTML and exact parse atomically under a shared file lock."""
    target.mkdir(parents=True, exist_ok=True)
    with FileLock(str(target / ".capture.lock"), timeout=30):
        for name, data in (
            ("itoko-official-viewer.html", raw),
            ("itoko-japanese-printed60.json",
             (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8")),
        ):
            with tempfile.NamedTemporaryFile(
                dir=target, prefix=".itoko-", suffix=".tmp", delete=False
            ) as stream:
                temporary = Path(stream.name)
                stream.write(data)
            os.replace(temporary, target / name)


def capture(source_key: str = "itoko", target: Path = OUTPUT) -> dict:
    """Retrieve the one explicitly public code, retaining unranked provenance."""
    source = PUBLIC_SOURCES[source_key]
    code = source["code"]
    url = f"https://www.pokemon-card.com/deck/confirm.html/deckID/{code}/"
    response = requests.get(
        url,
        timeout=30,
        headers={"User-Agent": "Mozilla/5.0 (compatible; ExpandedResearch/1.0)"},
    )
    response.raise_for_status()
    result = parse_saved_deck(response.content, source_key)
    archive(response.content, result, target)
    return result


if __name__ == "__main__":
    report = capture()
    print(json.dumps({
        "source": report["source_article"],
        "poster": report["poster"],
        "printed_rows": report["japanese_printing_rows"],
        "copies": report["total_physical_copies"],
        "categories": report["category_counts"],
        "print_ids_are_official_saved_deck_viewer": True,
        "registered_player_or_rank_authenticated": False,
        "promotable_to_aichi_ranked_field": False,
    }, ensure_ascii=False, indent=2))
