"""Exact Prize-only feasibility bound for Basic-rescuable and other combo roles.

A non-Prized Heavy Ball can recover one wholly Prized Basic role. Other
required roles have no designated Prize rescue. Search and gameplay omitted.
"""
from fractions import Fraction
from itertools import product
from math import comb, prod


def choose(n, k):
    return comb(n, k) if 0 <= k <= n else 0


def combo_prize_cuts(basic_roles, other_roles, balls, other_basics,
                     *, deck_size=60, opening=7, prizes=6):
    roles = tuple(basic_roles) + tuple(other_roles)
    all_counts = roles + (balls, other_basics)
    b = len(basic_roles)
    total_basics = sum(basic_roles) + other_basics
    filler = deck_size - sum(all_counts)
    if (not b or not other_roles or
            any(type(x) is not int or x < 0 for x in
                all_counts + (deck_size, opening, prizes)) or
            any(x == 0 for x in roles) or filler < 0 or opening < 1 or
            deck_size < opening + prizes):
        raise ValueError("Invalid role counts or physical deal.")

    denominator = (
        choose(deck_size, opening) - choose(deck_size-total_basics, opening)
    ) * choose(deck_size-opening, prizes)
    if not denominator:
        raise ValueError("No valid opening.")
    total = basic_bad = other_bad = either_bad = 0
    for alloc in product(*(range(n+1) for n in all_counts)):
        consumed = sum(alloc)
        if consumed > prizes:
            continue
        prize_ways = prod(choose(n, k) for n, k in zip(all_counts, alloc))
        prize_ways *= choose(filler, prizes-consumed)
        basics_remaining = total_basics - sum(alloc[:b]) - alloc[-1]
        valid_hands = (
            choose(deck_size-prizes, opening)
            - choose(deck_size-prizes-basics_remaining, opening)
        )
        weight = prize_ways * valid_hands
        stranded = sum(k == n for k, n in zip(alloc[:b], basic_roles))
        missing_basic = stranded > balls-alloc[-2]
        missing_other = any(
            k == n for k, n in zip(alloc[b:-2], other_roles)
        )
        total += weight
        basic_bad += weight * missing_basic
        other_bad += weight * missing_other
        either_bad += weight * (missing_basic or missing_other)
    if total != denominator:
        raise AssertionError("Card-zone partition is incomplete.")
    p = Fraction(either_bad, denominator)
    return {
        "basic_rescue_cut": Fraction(basic_bad, denominator),
        "other_role_cut": Fraction(other_bad, denominator),
        "either_cut": p,
        "prize_feasible": 1-p,
    }
