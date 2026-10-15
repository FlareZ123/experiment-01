"""Import original 2026 Aichi Open League decklists with exact card printings.

The 29 published decks are extracted from Limitless tournament markup. Remaining
placements keep their verified archetypes and are flagged as unpublished.
"""
import csv
import json
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup
from filelock import FileLock

SOURCE_URL = "https://www.limitlesstcg.com/tournaments/566/decklists"
ROOT = Path(__file__).resolve().parents[1]
FIELD_PATH = ROOT / "results" / "aichi-2026" / "field.csv"
OUTPUT_PATH = ROOT / "results" / "aichi-2026" / "full-decklists.json"
PLACEMENT = re.compile(r"^(\d+)(?:st|nd|rd|th)\s+(.+)$")
CATEGORY = re.compile(r"^(Pokémon|Trainer|Energy)\s*\((\d+)\)$")


def parse_decks(html: str, expected_field: list[dict[str, str]]) -> dict:
    """Parse the tournament page and validate every published entry."""
    soup = BeautifulSoup(html, "html.parser")
    wrappers = soup.select(".tournament-decklist")
    assert len(wrappers) == 29, f"Expected 29 published lists, found {len(wrappers)}"

    expected_by_rank = {int(row["rank"]): row for row in expected_field}
    assert len(expected_by_rank) == 32
    decks = []
    for wrapper in wrappers:
        toggle = wrapper.select_one(".decklist-toggle")
        match = PLACEMENT.fullmatch(toggle.get_text(" ", strip=True))
        assert match, f"Unrecognized ranking: {toggle.get_text(' ', strip=True)}"
        rank, player = int(match.group(1)), match.group(2)
        expected = expected_by_rank[rank]
        assert expected["player"] == player, f"Rank {rank} player changed: {player}"
        assert expected["full_list_published"] == "yes", f"Unexpected rank {rank}"

        title = wrapper.select_one(".decklist-title")
        archetype = next((s.strip() for s in title.find_all(string=True, recursive=False)
                          if s.strip()), "")
        assert archetype, f"Missing archetype for rank {rank}"
        cards = []
        category_counts = {}
        for column in wrapper.select(".decklist-column"):
            heading = column.select_one(".decklist-column-heading")
            m = CATEGORY.fullmatch(heading.get_text(" ", strip=True))
            assert m, f"Unrecognized category for rank {rank}"
            category, expected_count = m.group(1), int(m.group(2))
            assert category not in category_counts
            subtotal = 0
            for card in column.select(".decklist-card"):
                count_tag = card.select_one(".card-count")
                name_tag = card.select_one(".card-name")
                assert count_tag is not None and name_tag is not None
                count = int(count_tag.get_text(strip=True))
                assert 1 <= count <= 60
                printing = {
                    "set": card.get("data-set") or None,
                    "number": card.get("data-number") or None,
                    "language": card.get("data-lang") or None,
                }
                cards.append({
                    "category": category,
                    "count": count,
                    "name": name_tag.get_text(" ", strip=True),
                    "printing": printing,
                })
                subtotal += count
            assert subtotal == expected_count, (
                f"Rank {rank} {category}: heading {expected_count}, counted {subtotal}"
            )
            category_counts[category] = subtotal
        assert set(category_counts) == {"Pokémon", "Trainer", "Energy"}
        assert sum(category_counts.values()) == 60, f"Rank {rank} is not 60 cards"
        decks.append({
            "rank": rank,
            "player": player,
            "archetype": archetype,
            "category_counts": category_counts,
            "cards": cards,
        })

    ranks = [deck["rank"] for deck in decks]
    assert len(set(ranks)) == 29
    assert ranks == sorted(ranks)
    assert {rank for rank, row in expected_by_rank.items()
            if row["full_list_published"] == "yes"} == set(ranks)
    missing = [
        {"rank": int(row["rank"]), "player": row["player"], "archetype": row["archetype"]}
        for row in expected_field if row["full_list_published"] == "no"
    ]
    assert [item["rank"] for item in missing] == [23, 25, 28]
    return {
        "source": SOURCE_URL,
        "event": "CL Aichi Open League, 2026-05-10",
        "region": "Japan",
        "scope_note": "Printing IDs follow Limitless English display where available; verify Japanese legality and original printings separately.",
        "published_deck_count": len(decks),
        "total_placements": len(expected_by_rank),
        "missing_full_lists": missing,
        "decks": decks,
    }


def main() -> None:
    with FIELD_PATH.open(encoding="utf-8-sig", newline="") as stream:
        expected = list(csv.DictReader(stream))
    request = Request(SOURCE_URL, headers={
        "User-Agent": "Mozilla/5.0 (compatible; expanded-tcg-research/1.0)"
    })
    with urlopen(request, timeout=40) as response:
        html = response.read().decode("utf-8")
    result = parse_decks(html, expected)
    result["retrieved_at_utc"] = datetime.now(timezone.utc).isoformat(timespec="seconds")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(f"{OUTPUT_PATH}.lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=OUTPUT_PATH.parent,
            prefix=".aichi-import-", suffix=".tmp", delete=False
        ) as temp:
            json.dump(result, temp, ensure_ascii=False, indent=2)
            temp.write("\n")
            temporary_path = Path(temp.name)
        os.replace(temporary_path, OUTPUT_PATH)

    missing_printings = sum(
        not card["printing"]["set"] or not card["printing"]["number"]
        for deck in result["decks"] for card in deck["cards"]
    )
    print(f"Imported {len(result['decks'])} published decks / 32 placements.")
    print(f"Individual card rows: {sum(len(d['cards']) for d in result['decks'])}")
    print(f"Card rows lacking display printing ID: {missing_printings}")
    print(f"Unpublished deck ranks: {[x['rank'] for x in result['missing_full_lists']]}")
    print(f"Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
