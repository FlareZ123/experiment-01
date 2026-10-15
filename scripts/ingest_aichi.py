"""Fetch and validate published 2026 Aichi Open League name-level decklists."""
from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import re
import tempfile
from dataclasses import dataclass
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from filelock import FileLock

SOURCE = "https://www.limitlesstcg.com/tournaments/566/decklists"
SECTION = re.compile(r"^(Pok[eé]mon|Trainer|Energy)\s*\((\d+)\)$")
ENTRY = re.compile(r"^(\d{1,2})\s+(.+)$")
HEADING = re.compile(r"^(\d+)(?:st|nd|rd|th)\s+(.+)$")
CATEGORIES = ("Pokémon", "Trainer", "Energy")


@dataclass(frozen=True)
class Player:
    rank: int
    player: str
    archetype: str
    published: bool


def load_field(csv_text: str) -> list[Player]:
    field = [Player(int(r["rank"]), r["player"], r["archetype"],
                    r["full_list_published"] == "yes")
             for r in csv.DictReader(io.StringIO(csv_text))]
    if sorted(p.rank for p in field) != list(range(1, 33)):
        raise ValueError("Expected exactly 32 unique ranked placements")
    if sum(p.published for p in field) != 29:
        raise ValueError("Published-list count changed; re-audit source")
    return field


def visible_tokens(html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    main = soup.select_one("main") or soup.select_one("body") or soup
    tokens = [" ".join(s.split()) for s in main.stripped_strings]
    merged: list[str] = []
    i = 0
    while i < len(tokens):
        token = tokens[i]
        following = tokens[i + 1] if i + 1 < len(tokens) else ""
        join = (
            (token in ("Pokémon", "Pokemon", "Trainer", "Energy")
             and re.fullmatch(r"\(\d+\)", following))
            or (re.fullmatch(r"\d{1,2}", token)
                and re.search(r"[A-Za-zÀ-ÿ]", following))
            or (re.fullmatch(r"\d+(?:st|nd|rd|th)", token) and following)
        )
        if join:
            merged.append(token + " " + following)
            i += 2
        else:
            merged.append(token)
            i += 1
    return merged


def extract_decks(html: str, field: list[Player]) -> dict:
    tokens = visible_tokens(html)
    placements: list[tuple[int, Player]] = []
    for p in field:
        if not p.published:
            continue
        matches = [i for i, token in enumerate(tokens)
                   if (m := HEADING.fullmatch(token))
                   and int(m.group(1)) == p.rank and m.group(2) == p.player]
        if len(matches) != 1:
            raise ValueError(f"Rank {p.rank}: expected exactly one heading, found {len(matches)}")
        placements.append((matches[0], p))
    placements.sort()
    decks = []
    for index, (start, p) in enumerate(placements):
        stop = placements[index + 1][0] if index + 1 < len(placements) else len(tokens)
        segment = tokens[start + 1:stop]
        sections: dict[str, list[dict]] = {}
        expected: dict[str, int] = {}
        current: str | None = None
        for token in segment:
            header = SECTION.fullmatch(token)
            if header:
                category = "Pokémon" if header.group(1) in ("Pokémon", "Pokemon") else header.group(1)
                if category in sections:
                    raise ValueError(f"Rank {p.rank}: repeated {category} heading")
                sections[category] = []
                expected[category] = int(header.group(2))
                current = category
                continue
            if token == "Copy to Clipboard":
                current = None
            if current is None:
                continue
            entry = ENTRY.fullmatch(token)
            if entry:
                count = int(entry.group(1))
                name = entry.group(2).removesuffix(" unreleased")
                if 1 <= count <= 60 and not name.startswith("$"):
                    sections[current].append({"count": count, "name": name})
        if tuple(sections) != CATEGORIES:
            raise ValueError(f"Rank {p.rank}: sections missing or out of order: {list(sections)}")
        totals = {key: sum(c["count"] for c in cards) for key, cards in sections.items()}
        if totals != expected or sum(totals.values()) != 60:
            raise ValueError(f"Rank {p.rank}: card counts disagree actual={totals} expected={expected}")
        decks.append({
            "rank": p.rank, "player": p.player, "archetype": p.archetype,
            "sections": sections, "section_totals": totals, "total_cards": 60,
            "printing_status": "unresolved"
        })
    return {
        "source": SOURCE, "source_sha256": hashlib.sha256(html.encode("utf-8")).hexdigest(),
        "region": "Japan", "event_date": "2026-05-10",
        "format": "Japanese paper Expanded",
        "card_identification": "card names/counts only; distinct printings may share names",
        "published_count": len(decks),
        "unpublished_ranks": [p.rank for p in field if not p.published],
        "decks": decks
    }


def download_page() -> str:
    response = requests.get(
        SOURCE, timeout=30,
        headers={"User-Agent": "pokemon-tests reproducible-deck-audit/1.0"}
    )
    response.raise_for_status()
    return response.text


def write_atomic(path: Path, contents: str) -> None:
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent, delete=False
        ) as output:
            output.write(contents)
            output.flush()
            os.fsync(output.fileno())
            temp_path = output.name
        os.replace(temp_path, path)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    field = load_field(
        (root / "results/aichi-2026/field.csv").read_text(encoding="utf-8")
    )
    result = extract_decks(download_page(), field)
    destination = root / "results/aichi-2026/published-name-level.json"
    write_atomic(destination, json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    print(f"Validated {result['published_count']} 60-card decks: {destination}")


if __name__ == "__main__":
    main()
