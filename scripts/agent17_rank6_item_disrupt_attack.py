"""Original rank6 Iron Thorns physical T2 Item + funded Volt Cyclone opportunity.

Independent exact first-7, two ordinary turn draws and six-Prize counting.
No source decision, paid G&H discard or actual engine attack is asserted.
"""
import json
from itertools import product
from math import comb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIELD = json.loads((ROOT / "results/aichi-2026/full-decklists.json").read_text(encoding="utf-8"))
DECK = next(d for d in FIELD["decks"] if d["rank"] == 6)
SIZES = {c["name"]: c["count"] for c in DECK["cards"]}
GROUPS = [
    SIZES["Iron Thorns ex"], SIZES["Guzma & Hala"], SIZES["Tag Call"],
    SIZES["Thunder Mountain ♢"], SIZES["Double Colorless Energy"],
    SIZES["Enhanced Hammer"], SIZES["Megaton Blower"]
]
GROUPS.append(60 - sum(GROUPS))
assert GROUPS == [4, 2, 2, 1, 1, 2, 1, 47]


def c(n: int, k: int) -> int:
    return comb(n, k) if 0 <= k <= n else 0


def prizes(deck: list[int], needed: list[int]) -> int:
    """Allowed six-Prize subsets of the 51 cards after first nine."""
    if any(deck[i] == 0 for i in needed):
        return 0
    result = 0
    for mask in range(1 << len(needed)):
        excluded = sum(deck[needed[i]] for i in range(len(needed)) if mask & (1 << i))
        result += (-1 if mask.bit_count() % 2 else 1) * c(51 - excluded, 6 - excluded)
    return result


def enumerate_physical() -> tuple[int, int]:
    valid = c(60, 7) - c(56, 7)
    denominator = valid * c(53, 2) * c(51, 6)
    numerator = 0
    for first in product(*(range(min(n, 7) + 1) for n in GROUPS[:-1])):
        last = 7 - sum(first)
        if not 0 <= last <= 47 or first[0] == 0:
            continue
        seven = list(first) + [last]
        first_ways = 1
        for a, b in zip(GROUPS, seven):
            first_ways *= c(a, b)
        available = [a - b for a, b in zip(GROUPS, seven)]
        for extra in product(*(range(min(n, 2) + 1) for n in available[:-1])):
            other = 2 - sum(extra)
            if not 0 <= other <= available[-1]:
                continue
            drawn = list(extra) + [other]
            nine = [a + b for a, b in zip(seven, drawn)]
            if nine[5] + nine[6] == 0:  # no Hammer or Megaton by source T2
                continue
            needed = [i for i in (3, 4) if nine[i] == 0]
            if needed:
                if nine[1] > 0:
                    pass  # G&H is held; search the missing resource
                elif nine[2] > 0:
                    needed.append(1)  # Tag Call needs a surviving G&H
                else:
                    continue
            remaining = [a - b for a, b in zip(available, drawn)]
            ways = first_ways
            for a, b in zip(available, drawn):
                ways *= c(a, b)
            numerator += ways * prizes(remaining, needed)
    return numerator, denominator


if __name__ == "__main__":
    numerator, denominator = enumerate_physical()
    assert numerator == 482733542137566326
    assert denominator == 3829008553747977600
    print(json.dumps({
        "status": "PASS",
        "original_source_rank": 6,
        "probability_percent": numerator / denominator * 100,
        "event": "Item Hammer/Megaton seen + original G&H/Tag Call or held DCE/Mountain for Volt Cyclone",
        "qualified_games": 0
    }, indent=2))
