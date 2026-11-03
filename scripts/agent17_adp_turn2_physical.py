"""Exact narrow ADP T1 / Regidrago T2 physically accessible hand and Prize test.

Search and player choices, legal payment, opponent actions and competitive results
are not simulated. Candidate deck JSON remains unchanged.
"""
import json
from itertools import product
from math import comb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json").read_text(encoding="utf-8"))
COUNTS = {row["id"]: row["count"] for row in MANIFEST["cards"]}
GROUPS = [
    COUNTS["sm12-156"], COUNTS["xy6-97"], COUNTS["sm12-206"],
    COUNTS["sm12-193"], COUNTS["swsh11-167"], COUNTS["swsh12-136"],
    COUNTS["swsh12pt5-152"] + COUNTS["swsh12pt5-153"],
    COUNTS["xy4-92"], COUNTS["swsh12-135"], COUNTS["xy2-69"]
]
GROUPS.append(60 - sum(GROUPS))
assert GROUPS == [2, 4, 4, 3, 4, 3, 7, 4, 3, 1, 25]


def choose(n: int, k: int) -> int:
    return comb(n, k) if 0 <= k <= n else 0


def favorable_prizes(deck: list[int], required: list[int], available: int) -> int:
    """Six-Prize subsets that leave at least one physical copy in each group."""
    if any(deck[index] == 0 for index in required):
        return 0
    total = 0
    for mask in range(1 << len(required)):
        excluded = sum(deck[required[i]] for i in range(len(required)) if mask & (1 << i))
        total += (-1 if mask.bit_count() % 2 else 1) * choose(available - excluded, 6 - excluded)
    return total


def enumerate_strict() -> tuple[int, int, list[int]]:
    """Count accessible T1 GX + T2 hand with one real deck draw after two Compressor discards."""
    categories = GROUPS
    valid_seven = comb(60, 7) - comb(53, 7)
    denominator = valid_seven * 53 * comb(52, 6) * 44
    routes = [0, 0, 0]
    for prefix in product(*(range(min(count, 7) + 1) for count in categories[:-1])):
        last = 7 - sum(prefix)
        if not 0 <= last <= categories[-1] or prefix[0] == 0:
            continue
        seven = list(prefix) + [last]
        hand_ways = 1
        for count, selected in zip(categories, seven):
            hand_ways *= comb(count, selected)
        for category, count in enumerate(categories):
            remaining_count = count - seven[category]
            if remaining_count <= 0:
                continue
            first_eight = seven.copy()
            first_eight[category] += 1
            if first_eight[7] == 0:  # Battle Compressor first turn
                continue
            missing_t2 = [index for index in (4, 5, 6) if first_eight[index] == 0]
            if len(missing_t2) > 1:
                continue
            if first_eight[1]:
                route, required = 0, [8, 9]
            elif first_eight[3]:
                route, required = 1, [8, 9, 1]
            elif first_eight[2]:
                route, required = 2, [8, 9, 1, 3]
            else:
                continue
            deck = [total - held for total, held in zip(categories, first_eight)]
            survive = favorable_prizes(deck, required, 52)
            if len(missing_t2) == 0:
                count_t2 = 44 * survive
            else:
                target = missing_t2[0]
                deck_without_one = deck.copy()
                deck_without_one[target] -= 1
                count_t2 = deck[target] * favorable_prizes(deck_without_one, required, 51)
            routes[route] += hand_ways * remaining_count * count_t2
    return sum(routes), denominator, routes


if __name__ == "__main__":
    numerator, denominator, channels = enumerate_strict()
    assert numerator == 55881889003296496
    assert denominator == 11017478796701977600
    assert sum(channels) == numerator
    print(json.dumps({
        "status": "PASS",
        "candidate_sha": MANIFEST["canonicalCardsSha256"],
        "physical_t1_gx_t2_direct_compressor_percent": 100 * numerator / denominator,
        "channel_percent": [100 * x / denominator for x in channels],
        "qualification": "physical opportunity only, no native game or source response"
    }, indent=2))
