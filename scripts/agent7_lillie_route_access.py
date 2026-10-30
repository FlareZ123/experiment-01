"""Exact card-location event for the Tinkaton/Lillie turn-two route.

This is an optimistic source-free route-family screen, not executable play:
Poffin/Incense may be unplayable, lack legal targets, consume resources, or
compete with other actions. Other search channels are deliberately omitted.
"""

from fractions import Fraction
from math import comb


def apparent_lillie_route(lillie_copies=2, ex_or_incense=7):
    """P(valid opener, T1 Tinkatink/Poffin, T2 ex/search/Candy/Energy/Lillie).

    Fixed disjoint identity categories in a 60:
    * Tinkatink 4; Buddy-Buddy Poffin 4; other Basic Pokémon 7.
    * Tinkaton ex or Evolution Incense: ex_or_incense copies.
    * Rare Candy 4; two-Colorless Energy 6; Lillie: lillie_copies.
    * all remaining cards occupy the unclassified remainder.

    First seven are the opening hand. The eighth marginal card is the normal
    first-turn draw, and ninth is the normal second-turn draw. Random Prize
    cards interposed between those draws preserve the marginal 9-card
    distribution when no search, observation or intervening draw is modeled.

    The outcome is the event that:
    1. at least one of the 11 Basics is present in opening seven;
    2. Tinkatink or Poffin is present by first-turn draw (first eight);
    3. one from each of four other named disjoint categories is seen
       by second-turn draw (first nine).
    """
    missing_counts = (ex_or_incense, 4, 6, lillie_copies)
    probability = Fraction(0)
    for mask in range(1 << len(missing_counts)):
        missing = sum(n for bit, n in enumerate(missing_counts)
                      if mask & (1 << bit))
        for no_tinkatink_or_poffin in (0, 1):
            for no_basic_opening in (0, 1):
                exclude_first_seven = (
                    15 if no_tinkatink_or_poffin and no_basic_opening
                    else 8 if no_tinkatink_or_poffin
                    else 11 if no_basic_opening
                    else 0
                )
                # First seven avoid any selected missing ninth-turn families,
                # and additionally avoid first-eight and/or opening families.
                term = Fraction(
                    comb(60 - missing - exclude_first_seven, 7),
                    comb(60, 7)
                )
                # Eighth card may not be in the first-eight-excluded family.
                term *= Fraction(53 - missing - 8 * no_tinkatink_or_poffin, 53)
                # Ninth can belong to any allowed ninth-turn family.
                term *= Fraction(52 - missing, 52)
                sign = (-1) ** (
                    mask.bit_count() + no_tinkatink_or_poffin + no_basic_opening
                )
                probability += sign * term
    return probability
