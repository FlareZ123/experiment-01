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


def prizes(deck: list[int], needed: list[int], remaining_total: int) -> int:
    """Allowed six-Prize subsets after the initial seven and all modeled draws."""
    if any(deck[i] == 0 for i in needed):
        return 0
    result = 0
    for mask in range(1 << len(needed)):
        excluded = sum(deck[needed[i]] for i in range(len(needed)) if mask & (1 << i))
        result += (-1 if mask.bit_count() % 2 else 1) * c(remaining_total - excluded, 6 - excluded)
    return result


def enumerate_physical(bonus: int = 0) -> tuple[int, int]:
    draws = 2 + bonus
    valid = c(60, 7) - c(56, 7)
    denominator = valid * c(53, draws) * c(53 - draws, 6)
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
        for extra in product(*(range(min(n, draws) + 1) for n in available[:-1])):
            other = draws - sum(extra)
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
            numerator += ways * prizes(remaining, needed, 53 - draws)
    return numerator, denominator


if __name__ == "__main__":
    numerator, denominator = enumerate_physical()
    assert numerator == 482733542137566326
    assert denominator == 3829008553747977600
    q_candidate = c(53, 7) / c(60, 7)
    q_source = c(56, 7) / c(60, 7)
    conditional = 0.0
    rows = []
    for bonus in range(16):
        good, total = enumerate_physical(bonus)
        mass = ((1 - q_candidate) / (1 - q_candidate * q_source)
                if bonus == 0 else
                (1 - q_candidate) * (1 - q_source) * q_candidate ** bonus /
                (1 - q_candidate * q_source))
        conditional += mass * good / total
        rows.append((bonus, 100 * good / total))
    tail = (1 - q_source) * q_candidate ** 16 / (1 - q_candidate * q_source)
    assert abs(conditional - 0.13625497380194732) < 1e-12
    assert tail < 2.19e-7
    assert abs(rows[1][1] - 15.457331173573) < 1e-9
    print(json.dumps({
        "status": "PASS",
        "original_source_rank": 6,
        "probability_percent": numerator / denominator * 100,
        "full_bonus_mulligan_percent_lower": 100 * conditional,
        "full_bonus_mulligan_percent_upper": 100 * (conditional + tail),
        "mulligan_tail_mass": tail,
        "bonus_count_probabilities_first_four": rows[:4],
        "event": "Item Hammer/Megaton seen + original G&H/Tag Call or held DCE/Mountain for Volt Cyclone",
        "qualified_games": 0
    }, indent=2))
