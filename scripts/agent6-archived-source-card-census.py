"""Count accepted original-source card plays in an archived native scout ZIP.

Reads the unmodified GitHub Actions artifact with Python's standard zipfile
and json libraries. Does not run games, modify files, or certify tactics.
"""

from collections import Counter
import json
from pathlib import Path
import sys
from zipfile import ZipFile

INNER_NAME = "agent41-prospective-canonical-32.json"


def source_card_census(archive_path: Path) -> dict:
    with ZipFile(archive_path) as archive:
        data = json.loads(archive.read(INNER_NAME))
    rows = data["developmentResult"]["rows"]
    assert len(rows) == 32, "The complete precommitted arm denominator is required"
    result = {}
    for rank in (6, 11):
        subset = [r for r in rows if r["trial"]["rank"] == rank]
        assert len(subset) == 16
        cards: Counter[str] = Counter()
        candidate_plays = 0
        for row in subset:
            seat = row["sourceSeat"]
            for root in row["rootActionLedger"]:
                if root["action"] != "PlayCardAction":
                    continue
                if root["playerSlot"] == seat:
                    cards[root["card"]] += 1
                else:
                    candidate_plays += 1
        result[str(rank)] = {
            "attempted": len(subset),
            "accepted_source_card_plays": sum(cards.values()),
            "source_cards": dict(cards.most_common()),
            "accepted_candidate_card_plays": candidate_plays,
            "competitive_qualified_games": 0,
        }
    return result


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Supply the previously verified artifact ZIP path")
    print(json.dumps(source_card_census(Path(sys.argv[1])), indent=2))
