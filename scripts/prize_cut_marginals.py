"""Exact physical-Prize marginal and valid-opener conditional rescue capacity.

This supplements the legacy prize_recovery_capacity_cut implementation, whose
`cut_unconditional` field actually denotes the joint event cut AND valid opener.
No game-play access, alternate rescue effects or match wins are modeled.
"""
from fractions import Fraction
from itertools import product

from scripts.prize_recovery_capacity import (
    choose,
    prize_recovery_capacity_cut,
)


def prize_cut_probabilities(
    critical_basic_copies: tuple[int, ...],
    rescuer_copies: int,
    other_basics: int,
    *,
    deck_size: int = 60,
    opening: int = 7,
    prizes: int = 6,
) -> dict[str, Fraction]:
    """Return the actual unconditional Prize marginal and opening-adjusted events.

    A role is stranded when all its Basic copies are Prized. Each unprized
    rescuer can retrieve one stranded role, regardless of future card access.
    """
    model = prize_recovery_capacity_cut(
        critical_basic_copies,
        rescuer_copies,
        other_basics,
        deck_size=deck_size,
        opening=opening,
        prizes=prizes,
    )
    filler = deck_size - sum(critical_basic_copies) - rescuer_copies - other_basics
    bad_prize_subsets = 0
    for prized_roles in product(*(range(n + 1) for n in critical_basic_copies)):
        role_ways = 1
        for n, taken in zip(critical_basic_copies, prized_roles):
            role_ways *= choose(n, taken)
        stranded = sum(
            taken == n for n, taken in zip(critical_basic_copies, prized_roles)
        )
        for prized_rescuers in range(rescuer_copies + 1):
            if stranded <= rescuer_copies - prized_rescuers:
                continue
            for prized_other_basics in range(other_basics + 1):
                prized_filler = (
                    prizes - sum(prized_roles) - prized_rescuers
                    - prized_other_basics
                )
                bad_prize_subsets += (
                    role_ways
                    * choose(rescuer_copies, prized_rescuers)
                    * choose(other_basics, prized_other_basics)
                    * choose(filler, prized_filler)
                )
    conditional = model["cut_given_valid_opening"]
    valid = model["valid_opening"]
    return {
        "valid_opening": valid,
        "cut_given_valid_opening": conditional,
        "cut_unconditional": Fraction(bad_prize_subsets, choose(deck_size, prizes)),
        "cut_and_valid_opening": conditional * valid,
    }
