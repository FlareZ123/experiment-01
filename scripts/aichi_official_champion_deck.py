"""Archive exact Japanese print identities for the official Aichi Open champion.

The official champion interview links the saved 60 under the fixed deck code
below. Preserve official IDs, original Japanese names, printed sets and counts.
English-name matching and the complete Japanese legality ruling remain separate.
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

CODE = "QnLLQ9-qvPVqa-g9gi6Q"
URL = f"https://www.pokemon-card.com/deck/confirm.html/deckID/{CODE}/"
SECTIONS = ("deck_pke", "deck_gds", "deck_tool", "deck_tech",
            "deck_sup", "deck_sta", "deck_ene", "deck_ajs")
OUTPUT = Path("results/aichi-2026/official-champion-retrieval")


def parse_page(raw: bytes) -> dict:
    """Parse the server-rendered card inventory, never guessed image pixels."""
    page = raw.decode("utf-8")
    assert CODE in page, "Wrong deck code in official response"
    assert "60枚デッキ" in page, "No official saved 60-card marker"
    names = {
        int(card_id): html.unescape(value)
        for card_id, value in re.findall(
            r"PCGDECK\.searchItemName\[(\d+)\]='([^']+)';", page
        )
    }
    pictures = {
        int(card_id): value
        for card_id, value in re.findall(
            r"PCGDECK\.searchItemCardPict\[(\d+)\]='([^']+)';", page
        )
    }
    assert names and pictures, "Official printing dictionaries missing"
    rows = []
    for section in SECTIONS:
        match = re.search(
            'name="' + section + '" id="' + section + '" value="([^"]*)"',
            page,
        )
        assert match is not None, f"Missing official {section} slot"
        for entry in filter(None, match.group(1).split("-")):
            parts = entry.split("_")
            assert len(parts) == 3, f"Malformed official slot: {entry}"
            official_id, count, variant = map(int, parts)
            assert official_id in names and official_id in pictures
            assert count > 0
            edition = re.search(r"/large/([^/]+)/", pictures[official_id])
            assert edition is not None, f"Missing printed set for {official_id}"
            printed = names[official_id]
            japanese_name = printed.rpartition("(")[0] or printed
            rows.append({
                "section": section,
                "japanese_name": japanese_name,
                "official_print_label": printed,
                "japanese_card_id": official_id,
                "japanese_set": edition.group(1),
                "count": count,
                "variant": variant,
            })

    ids = [row["japanese_card_id"] for row in rows]
    assert len(ids) == len(set(ids)), "Same source ID repeated across sections"
    counts = {
        "pokemon": sum(r["count"] for r in rows if r["section"] == "deck_pke"),
        "trainer": sum(r["count"] for r in rows
                       if r["section"] not in ("deck_pke", "deck_ene")),
        "energy": sum(r["count"] for r in rows if r["section"] == "deck_ene"),
    }
    assert counts == {"pokemon": 18, "trainer": 31, "energy": 11}, (
        "Official viewer disagrees with published field categories", counts
    )
    assert sum(r["count"] for r in rows) == 60

    return {
        "schema": "aichi-champion-official-japanese-prints-v1",
        "event_date": "2026-05-10",
        "source_code": CODE,
        "official_url": URL,
        "official_interview": "https://www.pokemon-card.com/info/005499.html",
        "html_sha256": hashlib.sha256(raw).hexdigest(),
        "official_card_rows": len(rows),
        "category_counts": counts,
        "printed_copies": 60,
        "exact_japanese_print_identifiers_retrieved": True,
        "source_english_name_mapping_verified": False,
        "all_japanese_legality_verified": False,
        "field_simulation_qualified": False,
        "entries": rows,
    }


def archive(source: bytes, result: dict, directory: Path) -> None:
    """Atomic, locked write of both raw public evidence and parsed inventory."""
    directory.mkdir(parents=True, exist_ok=True)
    with FileLock(str(directory / ".capture.lock"), timeout=30):
        for filename, data in (
            ("champion-official-viewer.html", source),
            ("champion-japanese-print-60.json",
             (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode()),
        ):
            with tempfile.NamedTemporaryFile(
                dir=directory, prefix=".champion-", suffix=".tmp",
                delete=False,
            ) as handle:
                temp = Path(handle.name)
                handle.write(data)
            os.replace(temp, directory / filename)


def capture() -> dict:
    response = requests.get(
        URL, timeout=45,
        headers={"User-Agent": "Mozilla/5.0 (compatible; ExpandedResearch/1.0)"},
    )
    response.raise_for_status()
    source = response.content
    result = parse_page(source)
    archive(source, result, OUTPUT)
    return result


if __name__ == "__main__":
    report = capture()
    print(json.dumps({
        "schema": report["schema"],
        "official_code": report["source_code"],
        "original_html_sha256": report["html_sha256"],
        "distinct_printings": report["official_card_rows"],
        "category_counts": report["category_counts"],
        "printed_copies": report["printed_copies"],
        "entries": report["entries"],
        "english_mapping_still_required": True,
    }, ensure_ascii=False, indent=2))
