"""Exact opening access for the source Aichi 2026 rank-11 Oranguru V / Garbotoxin route.

This is a deliberately restricted *resource availability* event. It does not
model optimal decisions, opponent locks, Quick Ball, Secret Box, draw engines,
mulligan bonus draws, or competitive win rates.

Run as a standard-library-only Python script. The source-specific card counts
are from results/aichi-2026/full-decklists.json, rank 11.
"""

from fractions import Fraction
from itertools import combinations
from math import comb

NAMES = (
    "Oranguru V", "Trubbish", "Float Stone", "Boost Shake",
    "Battle VIP Pass", "Forest Seal Stone", "Garbodor", "other Basic", "other"
)
COUNTS = (2, 2, 3, 2, 4, 2, 2, 7, 36)
assert sum(COUNTS) == 60
PRIZE_CONFIGURATION_COUNT = comb(52, 6)


def compositions(position=0, remaining=8, selected=()):
    """Generate disjoint-category card counts for the first eight seen cards."""
    if position == len(COUNTS):
        if remaining == 0:
            yield selected
        return
    for k in range(min(remaining, COUNTS[position]) + 1):
        yield from compositions(position + 1, remaining - k, selected + (k,))


def favorable_prize_count(unseen, required):
    """Count six-card Prize sets keeping each required group searchable.

    For a subset S of required, disjoint categories, the event that every
    remaining card of every category in S is Prized has
    C(52 - sum_S remaining, 6 - sum_S remaining) possibilities.
    Inclusion-exclusion therefore calculates the exact complement.
    """
    total = PRIZE_CONFIGURATION_COUNT
    required = sorted(required)
    for size in range(1, len(required) + 1):
        for subset in combinations(required, size):
            k = sum(unseen[i] for i in subset)
            if k <= 6:
                total += (-1 if size % 2 else 1) * comb(52 - k, 6 - k)
    return total


def prize_count_for_route(seen):
    """Return favorable Prize allocations for the restricted opening line.

    A starting Oranguru V can use Back Order for Float Stone and/or Forest
    Seal Stone. Its Tool-free V slot can use Star Alchemy once for Boost Shake.
    Battle VIP Pass can fetch Trubbish if it was not already seen. Boost
    Shake then evolves the Tool-equipped Trubbish from an unprized Garbodor.
    """
    oranguru, trubbish, float_stone, boost, vip, forest, garbodor, _, _ = seen
    unseen = tuple(total - count for total, count in zip(COUNTS, seen))
    if oranguru == 0 or garbodor == COUNTS[6]:
        return 0
    if not trubbish and not vip:
        return 0
    if not trubbish and not unseen[1]:
        return 0
    if not float_stone and not unseen[2]:
        return 0
    if not boost and (not unseen[3] or not (forest or unseen[5])):
        return 0

    required = {6}
    if not trubbish:
        required.add(1)
    if not float_stone:
        required.add(2)
    if not boost:
        required.add(3)
        if not forest:
            required.add(5)
    return favorable_prize_count(unseen, required)


def exact_rates():
    """Return exact probabilities conditional on at least one Basic in seven.

    Prize cards are actually placed after the starting seven and before the
    eighth ordinary draw. By exchangeability, their joint uniform law can
    instead be calculated as eight seen cards followed by six Prizes from
    the remaining 52. Of the eight seen cards, one is the eighth draw; with
    exactly one Oranguru, 7/8 of its possible positions are in the first seven.
    """
    total = no_vip = no_stone = all_direct = 0
    combinations_considered = 0
    for seen in compositions():
        combinations_considered += 1
        favorable = prize_count_for_route(seen)
        if not favorable:
            continue
        ways = 1
        for count, observed in zip(COUNTS, seen):
            ways *= comb(count, observed)
        initial_oranguru_factor = 7 if seen[0] == 1 else 8
        contribution = ways * initial_oranguru_factor * favorable
        total += contribution
        if seen[1]:
            no_vip += contribution
        if seen[3]:
            no_stone += contribution
        if seen[1] and seen[2] and seen[3]:
            all_direct += contribution

    # Rank-11's eleven Basics: 2 Oranguru, 2 Trubbish, seven other Basics.
    legal_opening = Fraction(comb(60, 7) - comb(49, 7), comb(60, 7))
    denominator = 8 * comb(60, 8) * PRIZE_CONFIGURATION_COUNT
    assert combinations_considered == 6274
    return {
        "full_restricted_route": Fraction(total, denominator) / legal_opening,
        "trubbish_directly_seen": Fraction(no_vip, denominator) / legal_opening,
        "boost_shake_directly_seen": Fraction(no_stone, denominator) / legal_opening,
        "trubbish_float_boost_directly_seen": (
            Fraction(all_direct, denominator) / legal_opening
        ),
    }


if __name__ == "__main__":
    for name, probability in exact_rates().items():
        print(f"{name}: {float(probability) * 100:.12f}% ({probability})")
