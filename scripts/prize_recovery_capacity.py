"""Exact Prize-card rescue-capacity cuts, conditional on a valid opener.

A "critical role" is available from the non-Prize zones if at least one of
its copies is not Prized. Every fully-Prized critical Basic role requires
one independent Basic-from-Prizes retrieval to become accessible before taking
any Prize cards. Rescue cards in the Prizes cannot provide this retrieval.

This counts only structural Prize configurations, not reachable lines or wins.
"""
from fractions import Fraction
from itertools import product
from math import comb


def choose(n: int, k: int) -> int:
    """Return C(n,k), including zero for impossible finite samples."""
    return comb(n, k) if 0 <= k <= n else 0


def prize_recovery_capacity_cut(
    critical_basic_copies: tuple[int, ...],
    rescuer_copies: int,
    other_basics: int,
    *,
    deck_size: int = 60,
    opening: int = 7,
    prizes: int = 6,
) -> dict:
    """Exact chance designated Prize rescues cannot cover all Prized roles.

    Cards in each critical role share the same tactical function. A role
    requires rescue only if *every* copy of it is Prized. A non-Prized rescue
    Item can retrieve one critical Basic from the Prizes exactly once, under
    the abstract mechanism. The model conditions on having >=1 Basic in the
    opening hand and samples the full opening/Prize distribution without
    replacement. Distinct roles and Item copies remain distinguishable.

    The cut is insufficient rescue *capacity* in a static Prize configuration,
    not a probability of failing to access or use the tactical line.
    """
    values = (*critical_basic_copies, rescuer_copies, other_basics,
              deck_size, opening, prizes)
    if (not critical_basic_copies or
            any(type(v) is not int for v in values) or
            any(c <= 0 for c in critical_basic_copies) or
            rescuer_copies < 0 or other_basics < 0 or
            opening < 1 or prizes < 0 or deck_size < opening + prizes or
            sum(critical_basic_copies) + rescuer_copies + other_basics > deck_size):
        raise ValueError("Infeasible deck, opening or critical-role counts.")

    critical_basics = sum(critical_basic_copies)
    total_basics = critical_basics + other_basics
    fillers = deck_size - total_basics - rescuer_copies
    # A uniform ordered deal (hand first, Prizes next), conditioned on a
    # hand containing at least one Basic. All decks with this composition
    # have exactly this many accepted hand-and-Prize combinations.
    all_valid = (
        choose(deck_size, opening)
        - choose(deck_size - total_basics, opening)
    ) * choose(deck_size - opening, prizes)
    if not all_valid:
        raise ValueError("The deck cannot produce an accepted opening hand.")

    weighted_total = 0
    weighted_cut = 0
    breakdown: dict[tuple[int, int], int] = {}
    for role_prized in product(*(range(c + 1) for c in critical_basic_copies)):
        prized_critical = sum(role_prized)
        fully_prized_roles = sum(
            taken == copies
            for taken, copies in zip(role_prized, critical_basic_copies)
        )
        role_weight = 1
        for taken, copies in zip(role_prized, critical_basic_copies):
            role_weight *= choose(copies, taken)

        for rescuers_prized in range(rescuer_copies + 1):
            for others_prized in range(other_basics + 1):
                filler_prized = (
                    prizes - prized_critical - rescuers_prized - others_prized
                )
                prize_ways = (
                    role_weight
                    * choose(rescuer_copies, rescuers_prized)
                    * choose(other_basics, others_prized)
                    * choose(fillers, filler_prized)
                )
                remaining_basics = (
                    total_basics - prized_critical - others_prized
                )
                accepted_hands = (
                    choose(deck_size - prizes, opening)
                    - choose(deck_size - prizes - remaining_basics, opening)
                )
                ways = prize_ways * accepted_hands
                weighted_total += ways
                if fully_prized_roles > rescuer_copies - rescuers_prized:
                    weighted_cut += ways
                    key = (fully_prized_roles, rescuers_prized)
                    breakdown[key] = breakdown.get(key, 0) + ways

    if weighted_total != all_valid:
        raise AssertionError("Prize and opening zones did not partition the sample.")

    total_hands = choose(deck_size, opening)
    return {
        "valid_opening": Fraction(
            total_hands - choose(deck_size - total_basics, opening),
            total_hands,
        ),
        "cut_given_valid_opening": Fraction(weighted_cut, all_valid),
        "cut_unconditional": Fraction(
            weighted_cut,
            choose(deck_size, prizes) * choose(deck_size - prizes, opening),
        ),
        "failure_modes": {
            key: Fraction(count, all_valid)
            for key, count in sorted(breakdown.items())
        },
    }


if __name__ == "__main__":
    for role_copies, rescuers in [
        ((1, 1), 0), ((1, 1), 1), ((1, 1), 2),
        ((2, 1), 1), ((2, 2), 1)
    ]:
        result = prize_recovery_capacity_cut(
            role_copies, rescuers, other_basics=12
        )
        print(
            f"Critical groups {role_copies}, rescue Items {rescuers}: "
            f"{float(result['cut_given_valid_opening']):.9%} "
            "capacity cut after a valid opener"
        )
