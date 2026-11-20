#!/usr/bin/env python3
"""Bound exact-printing multiset actions for a fixed-cardinality deck remainder.

This is a combinatorial upper/lower-bound tool, not a legal-action generator.
Copies are grouped only by exact printing identity. If K0/K1/PARTIAL knowledge,
public history, or another observable distinction separates copies, split that
printing into separate input groups before using the model.
"""
from __future__ import annotations

from math import comb


# Exact counts from results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md.
# Each entry is one exact-printing identity; the 11 Basic Psychic Energy share
# one identity because the export normalizes them to CRE 232.
HOOD_SHADOW_RIDER_V1_COUNTS = [
    # Pokémon (18)
    4,  # Shadow Rider Calyrex V
    4,  # Shadow Rider Calyrex VMAX
    2,  # Lillie's Clefairy ex
    1,  # Tapu Lele-GX
    1,  # Trevenant & Dusknoir-GX
    1,  # Latias ex
    1,  # Dialga-GX
    1,  # Mimikyu
    1,  # Girafarig
    1,  # Marshadow
    1,  # Radiant Eternatus
    # Trainers (31)
    2,  # Lillie's Determination
    1,  # Iono
    1,  # Teammates
    1,  # Raihan
    1,  # Acerola
    1,  # Guzma
    4,  # Mysterious Treasure
    4,  # Fog Crystal
    2,  # VS Seeker
    1,  # Quick Ball
    1,  # Hisuian Heavy Ball
    1,  # Battle Compressor Team Flare Gear
    1,  # Field Blower
    1,  # Night Stretcher
    1,  # Unfair Stamp
    1,  # Float Stone
    1,  # Forest Seal Stone
    1,  # Sky Field
    1,  # Dimension Valley
    1,  # Pokémon Ranger
    2,  # Stealthy Hood
    1,  # Arven
    # Energy (11)
    11,  # Basic Psychic Energy CRE 232
]


def multiset_action_counts(m1: int, m2: int, m3: int) -> tuple[int, int]:
    """Return (exactly-three, zero-through-three) count-vector choices.

    m1/m2/m3 count identity groups with at least 1/2/3 available copies.
    """
    exact_two = (comb(m1, 2) if m1 >= 2 else 0) + m2
    exact_three = (
        (comb(m1, 3) if m1 >= 3 else 0)
        + m2 * max(0, m1 - 1)
        + m3
    )
    return exact_three, 1 + m1 + exact_two + exact_three


def remainder_bounds(counts: list[int], remaining: int) -> dict[str, object]:
    """Enumerate all feasible remaining-count profiles and bound multiset actions."""
    if any(not isinstance(count, int) or count < 0 for count in counts):
        raise ValueError("card counts must be nonnegative integers")
    if not isinstance(remaining, int) or remaining < 0 or remaining > sum(counts):
        raise ValueError("remaining must be between zero and the full deck size")

    # State = (cards retained, groups with >=1, groups with >=2, groups with >=3).
    states = {(0, 0, 0, 0)}
    for capacity in counts:
        next_states = set()
        for total, m1, m2, m3 in states:
            for kept in range(min(capacity, remaining - total) + 1):
                next_states.add((
                    total + kept,
                    m1 + int(kept >= 1),
                    m2 + int(kept >= 2),
                    m3 + int(kept >= 3),
                ))
        states = next_states

    profiles = []
    for total, m1, m2, m3 in states:
        if total != remaining:
            continue
        exact_three, zero_to_three = multiset_action_counts(m1, m2, m3)
        profiles.append((exact_three, zero_to_three, m1, m2, m3))

    if not profiles:
        raise ValueError("no feasible remainder profile")

    min_exact = min(profiles)
    max_exact = max(profiles, key=lambda row: row[0])
    min_upto = min(profiles, key=lambda row: row[1])
    max_upto = max(profiles, key=lambda row: row[1])

    return {
        "remaining": remaining,
        "identity_groups_full": len(counts),
        "groups_with_multiplicity_ge_2_full": sum(count >= 2 for count in counts),
        "groups_with_multiplicity_ge_3_full": sum(count >= 3 for count in counts),
        "feasible_profiles": len(profiles),
        "physical_exact_three": comb(remaining, 3) if remaining >= 3 else 0,
        "physical_zero_to_three": sum(
            comb(remaining, k) for k in range(min(3, remaining) + 1)
        ),
        "multiset_exact_three_min": {
            "count": min_exact[0], "m1": min_exact[2],
            "m2": min_exact[3], "m3": min_exact[4],
        },
        "multiset_exact_three_max": {
            "count": max_exact[0], "m1": max_exact[2],
            "m2": max_exact[3], "m3": max_exact[4],
        },
        "multiset_zero_to_three_min": {
            "count": min_upto[1], "m1": min_upto[2],
            "m2": min_upto[3], "m3": min_upto[4],
        },
        "multiset_zero_to_three_max": {
            "count": max_upto[1], "m1": max_upto[2],
            "m2": max_upto[3], "m3": max_upto[4],
        },
    }


def main() -> None:
    counts = HOOD_SHADOW_RIDER_V1_COUNTS
    assert len(counts) == 34
    assert sum(counts) == 60
    result = remainder_bounds(counts, remaining=47)
    print(result)


if __name__ == "__main__":
    main()
