"""Exact first-turn bench-entry and Prize-card opportunity models.

These are card-availability calculations, not game-win probabilities.
The prize sample can be exchanged with the first turn draw when conditioning
on their unordered union, because the shuffled deck is uniformly random.
"""

from fractions import Fraction
from math import comb


def choose(n: int, k: int) -> int:
    """Binomial coefficient, interpreted as zero for infeasible samples."""
    return comb(n, k) if 0 <= k <= n else 0


def radiant_gate(
    other_basics: int,
    vmax: int,
    *,
    total: int = 60,
    opening: int = 7,
    prizes: int = 6,
    required_vmax: int = 2,
) -> dict[str, Fraction]:
    """Opening + next draw: playable singleton Radiant, with VMAX in deck.

    A valid opening has at least one Basic. Radiant may enter from hand onto
    the Bench only when another Basic was among the opening cards to start
    Active. A single normal turn draw is included, but no search, bonus draws,
    Stadium, abilities or other actions are modeled.
    """
    if not (0 <= other_basics and 0 <= vmax and 1 <= required_vmax <= vmax
            and 0 < opening < total and 0 <= prizes <= total-opening-1
            and 1 + other_basics + vmax <= total):
        raise ValueError("Infeasible deck/sample configuration")
    seen = opening + 1
    remaining = total - seen
    others = total - 1 - other_basics - vmax
    valid_opening = Fraction(
        choose(total, opening) - choose(total - 1 - other_basics, opening),
        choose(total, opening),
    )
    benchable = Fraction(0)
    gate = Fraction(0)
    for basic_in_seen in range(1, min(other_basics, seen - 1) + 1):
        for vmax_in_seen in range(min(vmax, seen - 1 - basic_in_seen) + 1):
            filler_in_seen = seen - 1 - basic_in_seen - vmax_in_seen
            hand_weight = Fraction(
                choose(other_basics, basic_in_seen)
                * choose(vmax, vmax_in_seen)
                * choose(others, filler_in_seen),
                choose(total, seen),
            )
            # With one other Basic in the eight cards, it might be the
            # eighth card, leaving Radiant the only opening Basic.
            opening_valid_for_bench = (
                Fraction(opening, seen) if basic_in_seen == 1 else Fraction(1)
            )
            path_probability = hand_weight * opening_valid_for_bench
            benchable += path_probability
            target_left = vmax - vmax_in_seen
            in_deck_probability = sum(
                (
                    Fraction(
                        choose(target_left, prized_targets)
                        * choose(remaining - target_left, prizes - prized_targets),
                        choose(remaining, prizes),
                    )
                    for prized_targets in range(target_left - required_vmax + 1)
                ),
                Fraction(0),
            )
            gate += path_probability * in_deck_probability
    return {
        "valid_opening": valid_opening,
        "benchable_unconditional": benchable,
        "gate_unconditional": gate,
        "benchable_given_valid": benchable / valid_opening,
        "gate_given_valid": gate / valid_opening,
    }


def singleton_and_all_rescuers_prized(
    rescuers: int, *, total: int = 60, prizes: int = 6
) -> Fraction:
    """Probability a singleton and all its designated rescue copies are Prized.

    This is a static co-prizing event; it does not certify playable search lines,
    availability of a Supporter action, nor a resulting loss of the game.
    """
    if not (0 <= rescuers < total and 0 <= prizes <= total):
        raise ValueError("Infeasible singleton/rescuer configuration")
    return Fraction(
        choose(total - 1 - rescuers, prizes - 1 - rescuers),
        choose(total, prizes),
    )


if __name__ == "__main__":
    for vmax_count in (2, 3, 4):
        p = radiant_gate(other_basics=13, vmax=vmax_count)
        print(f"Shadow Rider: {vmax_count} VMAX, chance direct 2-VMAX gate"
              f" after valid opening: {float(p['gate_given_valid']):.8%}")
    print("Shadow Rider: benchable Radiant after valid opening:",
          f"{float(radiant_gate(13, 4)['benchable_given_valid']):.8%}")
    for rescuer_count in range(4):
        print(f"Singleton and all {rescuer_count} rescuers Prized:",
              f"{float(singleton_and_all_rescuers_prized(rescuer_count)):.8%}")
