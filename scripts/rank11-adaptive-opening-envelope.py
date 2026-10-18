"""Exact finite-population opportunity bound for Agent 25's rank-11 K0 script.

Printed counts come from Aichi Top-32 rank11, full-decklists.json.
Seven-card opener, six random Prizes, one mandatory turn draw, then 46-card deck.

The conditional policy starts only if Oranguru V is selected Active, VIP Pass
and Float Stone are among the first eight *seen* cards, and searches a remaining
Trubbish, Forest Seal Stone, Boost Shake and Garbodor. Counting assumes the
rank11 player goes first, chooses Oranguru whenever in its opening seven, and
is uninterrupted. Actual AI opening-choice and move frequencies are unknown.
"""

import json
from fractions import Fraction
from functools import lru_cache
from itertools import product
from math import comb, factorial

SOURCE_COPIES = {
    "Oranguru V": 2,
    "Battle VIP Pass": 4,
    "Float Stone": 3,
    "Trubbish": 2,
    "Forest Seal Stone": 2,
    "Boost Shake": 2,
    "Garbodor": 2,
}
BASIC_COPIES = 9
CAPACITY = (7, 6, 1, 46)
TOTAL_PARTITIONS = comb(60, 7) * comb(53, 6) * 47


def restricted_allocations(number, allowed):
    """Enumerate physical card assignments to opener, Prizes, draw, and deck."""
    for a in range(number + 1):
        for b in range(number - a + 1):
            for c in range(number - a - b + 1):
                d = number - a - b - c
                parts = (a, b, c, d)
                if any(parts[i] for i in range(4) if i not in allowed):
                    continue
                ways = (
                    comb(number, a)
                    * comb(number - a, b)
                    * comb(number - a - b, c)
                )
                yield a, b, c, ways


@lru_cache(maxsize=None)
def restricted_probability(no_oranguru, no_vip, no_float, missing_target_groups):
    """Chance that selected bad events hold, using exact labeled-card counting."""
    groups = (
        (2, (1, 2, 3) if no_oranguru else (0, 1, 2, 3)),
        (4, (1, 3) if no_vip else (0, 1, 2, 3)),
        (3, (1, 3) if no_float else (0, 1, 2, 3)),
    )
    if missing_target_groups:
        groups += ((2 * missing_target_groups, (0, 1, 2)),)

    assigned = {(0, 0, 0): 1}
    for amount, allowed in groups:
        next_assigned = {}
        for (a0, b0, c0), weight in assigned.items():
            for a, b, c, multiplicity in restricted_allocations(amount, allowed):
                key = (a0 + a, b0 + b, c0 + c)
                if any(key[i] > CAPACITY[i] for i in range(3)):
                    continue
                next_assigned[key] = (
                    next_assigned.get(key, 0) + weight * multiplicity
                )
        assigned = next_assigned

    ordinary_count = 51 - 2 * missing_target_groups
    numerator = 0
    for (a, b, c), weight in assigned.items():
        special_count = 9 + 2 * missing_target_groups
        used_deck = special_count - a - b - c
        remainder = (7 - a, 6 - b, 1 - c, 46 - used_deck)
        if min(remainder) < 0 or sum(remainder) != ordinary_count:
            continue
        ways = (
            comb(ordinary_count, remainder[0])
            * comb(ordinary_count - remainder[0], remainder[1])
            * comb(
                ordinary_count - remainder[0] - remainder[1],
                remainder[2],
            )
        )
        numerator += weight * ways
    return Fraction(numerator, TOTAL_PARTITIONS)


def calculate():
    """Compute exact probability conditional on a Basic-valid seven-card opener."""
    assert sum(SOURCE_COPIES.values()) == 17
    legal = 1 - Fraction(comb(60 - BASIC_COPIES, 7), comb(60, 7))

    def oranguru_and_category_absent(number):
        return Fraction(comb(60 - number, 8), comb(60, 8)) * (
            1 - Fraction(comb(58 - number, 7), comb(60 - number, 7))
        )

    has_oranguru = 1 - Fraction(comb(58, 7), comb(60, 7))
    gate = (
        has_oranguru
        - oranguru_and_category_absent(4)
        - oranguru_and_category_absent(3)
        + oranguru_and_category_absent(7)
    )

    # Inclusion-exclusion over the three opening failures and the four
    # two-copy search targets absent from the deck following the turn draw.
    complete = Fraction(0, 1)
    for no_o, no_vip, no_float in product((0, 1), repeat=3):
        for missed in range(5):
            sign = (-1) ** (no_o + no_vip + no_float + missed)
            complete += (
                sign * comb(4, missed)
                * restricted_probability(no_o, no_vip, no_float, missed)
            )

    assert Fraction(0) < complete < gate < legal
    return {
        "research": "rank11-k0-conditional-opening-resource-envelope-v1",
        "exactPrintedCopies": SOURCE_COPIES,
        "basicCopies": BASIC_COPIES,
        "legalSevenProbability": float(legal),
        "k0EligibilityGivenValidSeven": float(gate / legal),
        "searchableFullLineGivenValidSeven": float(complete / legal),
        "searchableFullLineGivenK0Eligibility": float(complete / gate),
        "exactFullySearchableUnconditional": {
            "numerator": str(complete.numerator),
            "denominator": str(complete.denominator),
        },
        "gamesSimulated": 0,
        "playerPolicyCertified": False,
        "competitiveWinRateCertified": False,
    }


if __name__ == "__main__":
    print(json.dumps(calculate(), indent=2))
