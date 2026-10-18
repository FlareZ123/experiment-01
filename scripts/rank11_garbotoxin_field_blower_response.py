"""Exact first-response access to Field Blower against turn-one Garbotoxin.

Two immutable 60s: published Aichi champion rank 1 and frozen Hood Shield v1.
Source: results/aichi-2026/full-decklists.json and candidate-hood-shadow-rider.json.

The opponent (rank 11) has already established Tool-bearing Garbodor. This
model counts only first-eight-card resource availability, with 6 unknown Prizes
and a Basic-containing starting seven. A first-turn-going-second Supporter
is permitted. No search beyond directly held Arven is counted.
"""

from fractions import Fraction
from itertools import combinations
from math import comb

# Five mutually exclusive physical populations: Basic, Arven, Field Blower,
# Stealthy Hood, all other non-Basic cards.
DECKS = {
    "source_champion_rank1": (14, 0, 1, 0, 45),
    "hood_shield_v1": (14, 1, 1, 2, 42),
}
EVENTS = (
    "direct_field_blower",
    "additional_arven_to_unprized_field_blower",
    "union_field_blower_or_arven",
    "arven_with_field_blower_and_hood_resources",
)


def first_eight_compositions(categories, position=0, remaining=8, seen=()):
    if position == len(categories):
        if remaining == 0:
            yield seen
        return
    for k in range(min(categories[position], remaining) + 1):
        yield from first_eight_compositions(
            categories, position + 1, remaining - k, seen + (k,)
        )


def exact_response_rates(cards):
    """Return exact event probabilities conditional on a legal original seven.

    Prize allocation is represented as six selected from the 52 remaining
    after eight uniform seen cards. This is exchangeable with true setup's
    seven cards, six Prizes, and one compulsory first-turn draw.
    """
    basic, arven, blower, hood, other = cards
    assert sum(cards) == 60 and basic == 14 and blower == 1
    assert arven in (0, 1) and hood in (0, 2)

    direct = rescue = arven_multi = 0
    p_all = comb(52, 6)
    for seen in first_eight_compositions(cards):
        b, a, f, h, _ = seen
        if not b:
            continue
        valid_last_positions = 7 if b == 1 else 8
        multiplicity = valid_last_positions
        for n, k in zip(cards, seen):
            multiplicity *= comb(n, k)

        if f:
            direct += multiplicity * p_all

        if a and not f:
            # If Field Blower is unheld, it must remain out of six Prizes.
            rescue += multiplicity * comb(51, 6)

        if a and hood:
            # First both possible Blower zones are admitted, then require
            # at least one Hood in the seen cards or remaining search deck.
            blower_prizes = p_all if f else comb(51, 6)
            if h:
                joint_prizes = blower_prizes
            elif f:
                joint_prizes = p_all - comb(50, 4)
            else:
                joint_prizes = comb(51, 6) - comb(49, 4)
            arven_multi += multiplicity * joint_prizes

    d = 8 * comb(60, 8) * p_all
    legal_seven = Fraction(comb(60, 7) - comb(46, 7), comb(60, 7))
    direct_p = Fraction(direct, d) / legal_seven
    rescue_p = Fraction(rescue, d) / legal_seven
    multi_p = Fraction(arven_multi, d) / legal_seven
    return dict(zip(EVENTS, (direct_p, rescue_p, direct_p + rescue_p, multi_p)))


if __name__ == "__main__":
    for deck_name, cards in DECKS.items():
        print(deck_name)
        for event, fraction in exact_response_rates(cards).items():
            print(f"  {event}: {float(fraction) * 100:.12f}% ({fraction})")
