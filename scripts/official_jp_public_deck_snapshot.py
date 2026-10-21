"""Recover a public Japanese Pokemon deck-code viewer as an attributed snapshot.

The viewer may substitute printings/rarities; this is not proof of the
physical list registered at an event. No tournament rank is assigned here.
"""
from __future__ import annotations

import hashlib
import html
import json
import os
import re
import sys
import tempfile
from pathlib import Path

from filelock import FileLock

KINDS = ("deck_pke", "deck_gds", "deck_tool", "deck_tech",
         "deck_sup", "deck_sta", "deck_ene", "deck_ajs")
DECK_CODE = re.compile(r"[A-Za-z0-9]{6}-[A-Za-z0-9]{6}-[A-Za-z0-9]{6}")


def parse_viewer(raw: bytes, source_code: str) -> dict:
    if DECK_CODE.fullmatch(source_code) is None:
        raise ValueError("Expected an official three-part public deck code")
    page = raw.decode("utf-8")
    if source_code not in page:
        raise ValueError("Deck viewer did not contain the requested deck code")

    names = {
        int(key): html.unescape(name)
        for key, name in re.findall(
            r"PCGDECK\.searchItemName\[(\d+)\]='([^']+)';", page
        )
    }
    pictures = {
        int(key): path
        for key, path in re.findall(
            r"PCGDECK\.searchItemCardPict\[(\d+)\]='([^']+)';", page
        )
    }
    entries = []
    for section in KINDS:
        match = re.search(
            r'name="' + section + r'" id="' + section + r'" value="([^"]*)"',
            page,
        )
        if match is None:
            raise ValueError(f"Missing official viewer section: {section}")
        for field in filter(None, match.group(1).split("-")):
            parts = field.split("_")
            if len(parts) != 3:
                raise ValueError(f"Malformed {section} cell: {field!r}")
            card_id, quantity, variant = map(int, parts)
            if card_id not in names or card_id not in pictures:
                raise ValueError(f"Missing card identity for {card_id}")
            if quantity <= 0 or variant <= 0:
                raise ValueError("Nonpositive card count or variant")
            picture = pictures[card_id]
            edition = re.search(r"/large/([^/]+)/", picture)
            if edition is None:
                raise ValueError(f"Missing official set slug: {picture}")
            entries.append({
                "section": section,
                "japanese_card_id": card_id,
                "count": quantity,
                "variant": variant,
                "japanese_name": names[card_id],
                "japanese_set_slug": edition.group(1),
                "source_pict": picture,
            })

    copies = sum(row["count"] for row in entries)
    if copies != 60:
        raise ValueError(f"Public viewer did not resolve 60 cards: {copies}")
    return {
        "schema": "public-japanese-deck-viewer-snapshot-v1",
        "source_code": source_code,
        "source_url": (
            "https://www.pokemon-card.com/deck/confirm.html/deckID/"
            + source_code
        ),
        "viewer_html_sha256": hashlib.sha256(raw).hexdigest(),
        "cards": copies,
        "distinct_japanese_print_rows": len(entries),
        "printing_limit": (
            "Official code viewer printings may be substitute rarities; "
            "not independently verified physical event registration."
        ),
        "entries": entries,
    }


def save_atomic_locked(payload: dict, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(destination) + ".lock"):
        temp_name = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=destination.parent,
                prefix="." + destination.name + ".", suffix=".tmp",
                delete=False,
            ) as handle:
                temp_name = handle.name
                json.dump(payload, handle, ensure_ascii=False, indent=2)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_name, destination)
        finally:
            if temp_name and os.path.exists(temp_name):
                os.unlink(temp_name)


if __name__ == "__main__":
    source = Path(sys.argv[1])
    code = sys.argv[2]
    destination = Path(sys.argv[3])
    result = parse_viewer(source.read_bytes(), code)
    save_atomic_locked(result, destination)
    print(json.dumps({
        "source_code": code,
        "cards": result["cards"],
        "distinct": result["distinct_japanese_print_rows"],
        "viewer_sha256": result["viewer_html_sha256"],
        "snapshot": str(destination),
        "printed_rows": [
            f'{row["count"]}x {row["japanese_name"]} ({row["japanese_set_slug"]} / {row["japanese_card_id"]})'
            for row in result["entries"]
        ],
    }, ensure_ascii=False))
