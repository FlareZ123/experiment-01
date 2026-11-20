#!/usr/bin/env python3
"""Bound exact-printing multiset actions for a fixed-cardinality deck remainder.

This is a combinatorial bound/expectation tool, not a legal-action generator.
Copies are grouped only by exact printing identity. If K0/K1/PARTIAL knowledge,
public history, or another observable distinction separates copies, split that
printing into separate input groups before using the model.
"""
from __future__ import annotations

from collections import defaultdict
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


def weighted_remainder_profiles(
    counts: list[int], remaining: int
) -> dict[tuple[int, int, int], int]:
    """Map (m1,m2,m3) to physical-removal multiplicity for this remainder size."""
    removed_target = sum(counts) - remaining
    # State = (cards removed, groups with >=1/2/3 copies remaining) -> ways.
    states = {(0, 0, 0, 0): 1}
    for capacity in counts:
        next_states: dict[tuple[int, int, int, int], int] = defaultdict(int)
        for (removed, m1, m2, m3), ways in states.items():
            for removed_here in range(min(capacity, removed_target - removed) + 1):
                kept = capacity - removed_here
                key = (
                    removed + removed_here,
                    m1 + int(kept >= 1),
                    m2 + int(kept >= 2),
                    m3 + int(kept >= 3),
                )
                next_states[key] += ways * comb(capacity, removed_here)
        states = dict(next_states)

    return {
        (m1, m2, m3): ways
        for (removed, m1, m2, m3), ways in states.items()
        if removed == removed_target
    }


def weighted_quantile(values: list[tuple[int, int]], q: float) -> int:
    """Return the first integer value whose cumulative weight reaches q."""
    if not 0 <= q <= 1:
        raise ValueError("q must be between zero and one")
    total = sum(weight for _, weight in values)
    target = q * total
    cumulative = 0
    for value, weight in sorted(values):
        cumulative += weight
        if cumulative >= target:
            return value
    return max(value for value, _ in values)


def remainder_bounds(counts: list[int], remaining: int) -> dict[str, object]:
    """Bound and average count-vector choices over all physical remainders."""
    if any(not isinstance(count, int) or count < 0 for count in counts):
        raise ValueError("card counts must be nonnegative integers")
    if not isinstance(remaining, int) or remaining < 0 or remaining > sum(counts):
        raise ValueError("remaining must be between zero and the full deck size")

    profile_weights = weighted_remainder_profiles(counts, remaining)
    rows = []
    for (m1, m2, m3), ways in profile_weights.items():
        exact_three, zero_to_three = multiset_action_counts(m1, m2, m3)
        rows.append((exact_three, zero_to_three, m1, m2, m3, ways))

    if not rows:
        raise ValueError("no feasible remainder profile")

    total_ways = sum(row[5] for row in rows)
    expected_total_ways = comb(sum(counts), sum(counts) - remaining)
    if total_ways != expected_total_ways:
        raise AssertionError(f"profile weights {total_ways} != physical remainder count {expected_total_ways}")
    expected_exact = sum(row[0] * row[5] for row in rows) / total_ways
    expected_upto = sum(row[1] * row[5] for row in rows) / total_ways

    min_exact = min(rows, key=lambda row: row[0])
    max_exact = max(rows, key=lambda row: row[0])
    min_upto = min(rows, key=lambda row: row[1])
    max_upto = max(rows, key=lambda row: row[1])

    return {
        "remaining": remaining,
        "identity_groups_full": len(counts),
        "groups_with_multiplicity_ge_2_full": sum(count >= 2 for count in counts),
        "groups_with_multiplicity_ge_3_full": sum(count >= 3 for count in counts),
        "feasible_profiles": len(profile_weights),
        "physical_remainders": total_ways,
        "physical_exact_three": comb(remaining, 3) if remaining >= 3 else 0,
        "physical_zero_to_three": sum(
            comb(remaining, k) for k in range(min(3, remaining) + 1)
        ),
        "multiset_exact_three": {
            "min": min_exact[0], "max": max_exact[0],
            "expected_uniform_remainder": round(expected_exact, 3),
            "m1_m2_m3_at_min": min_exact[2:5],
            "m1_m2_m3_at_max": max_exact[2:5],
        },
        "multiset_zero_to_three": {
            "min": min_upto[1], "max": max_upto[1],
            "expected_uniform_remainder": round(expected_upto, 3),
            "m1_m2_m3_at_min": min_upto[2:5],
            "m1_m2_m3_at_max": max_upto[2:5],
        },
    }


def main() -> None:
    counts = HOOD_SHADOW_RIDER_V1_COUNTS
    assert len(counts) == 34
    assert sum(counts) == 60
    # 47: after initial 7-card hand + 6 prizes, before the turn draw.
    # 46: after the first turn draw, assuming no mulligan or earlier effects.
    for remaining in (47, 46):
        print(remainder_bounds(counts, remaining))


if __name__ == "__main__":
    main()
