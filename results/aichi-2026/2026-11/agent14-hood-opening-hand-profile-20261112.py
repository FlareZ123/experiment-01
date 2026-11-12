#!/usr/bin/env python3
"""Exact raw seven-card opening-hand comparison: Hood candidate vs Aichi champion reference."""
from math import comb

DECK_SIZE = 60
OPENING_HAND = 7
DENOMINATOR = comb(DECK_SIZE, OPENING_HAND)


def at_least_one(group_size: int) -> float:
    return 1 - comb(DECK_SIZE - group_size, OPENING_HAND) / DENOMINATOR


def both_disjoint_groups(a: int, b: int) -> float:
    # Probability of >=1 from each of two disjoint card groups.
    return (
        1
        - comb(DECK_SIZE - a, OPENING_HAND) / DENOMINATOR
        - comb(DECK_SIZE - b, OPENING_HAND) / DENOMINATOR
        + comb(DECK_SIZE - a - b, OPENING_HAND) / DENOMINATOR
    )


def pct(value: float) -> str:
    return f"{100 * value:.2f}%"


decks = {
    "Hood candidate": {
        "basic_pokemon": 14,
        "shadow_rider_v": 4,
        "tapu_lele_gx": 1,
        "psychic_energy": 11,
        "supporters": 9,
        "search_items": 9,  # 4 Mysterious Treasure + 4 Fog Crystal + 1 Quick Ball
    },
    "Aichi champion reference": {
        "basic_pokemon": 14,
        "shadow_rider_v": 3,
        "tapu_lele_gx": 2,
        "psychic_energy": 11,
        "supporters": 9,
        "search_items": 9,
    },
}

for name, d in decks.items():
    v_access = d["shadow_rider_v"] + d["search_items"]
    print(name)
    print("  >=1 Basic Pokemon:", pct(at_least_one(d["basic_pokemon"])))
    print("  >=1 Shadow Rider V:", pct(at_least_one(d["shadow_rider_v"])))
    print("  >=1 Tapu Lele-GX:", pct(at_least_one(d["tapu_lele_gx"])))
    print("  >=1 V or Tapu Lele-GX:", pct(at_least_one(d["shadow_rider_v"] + d["tapu_lele_gx"])))
    print("  >=1 Psychic Energy:", pct(at_least_one(d["psychic_energy"])))
    print("  >=1 Supporter:", pct(at_least_one(d["supporters"])))
    print("  >=1 V-search item:", pct(at_least_one(d["search_items"])))
    print("  >=1 V and >=1 Psychic Energy:", pct(both_disjoint_groups(d["shadow_rider_v"], d["psychic_energy"])))
    print("  >=1 V-or-search and >=1 Psychic Energy:", pct(both_disjoint_groups(v_access, d["psychic_energy"])))
    print()

# Assertions preserve the exact list-composition assumptions behind the comparison.
assert sum([14, 31, 11]) == 60
assert decks["Hood candidate"]["basic_pokemon"] == decks["Aichi champion reference"]["basic_pokemon"]
assert decks["Hood candidate"]["psychic_energy"] == decks["Aichi champion reference"]["psychic_energy"]
assert decks["Hood candidate"]["supporters"] == decks["Aichi champion reference"]["supporters"]
assert decks["Hood candidate"]["search_items"] == decks["Aichi champion reference"]["search_items"]
