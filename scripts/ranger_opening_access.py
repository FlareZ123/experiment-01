"""Exact opening-window access to a hypothetical Pokémon Ranger tech.

Model: an unchanged 60-card deck with 2 Tapu Lele-GX, 12 other Basic
Pokémon and R Rangers replacing non-Basic slots. Seven opening cards,
six prizes from the 53 remaining, and no other draws or searches.
"""
from fractions import Fraction
from math import comb


def opening_access(ranger_copies: int, *, lele: int = 2,
                   other_basics: int = 12, deck_size: int = 60,
                   opening: int = 7, prizes: int = 6) -> dict:
    """Compute disjoint direct-hand and Wonder Tag access probabilities.

    The Wonder Tag route requires an opening Lele plus a distinct Basic
    to start Active (another Lele also qualifies), no Ranger already in
    hand, and an unprized Ranger.
    Neither Ability availability nor Supporter/play sequencing is proven.
    Probabilities are conditional on a valid seven-card Basic opening.
    """
    counts = (ranger_copies, lele, other_basics, deck_size, opening, prizes)
    if any(type(n) is not int for n in counts):
        raise TypeError("All counts must be integers")
    if (ranger_copies < 0 or lele < 0 or other_basics <= 0 or
            deck_size <= 0 or not 0 < opening < deck_size or
            not 0 <= prizes <= deck_size - opening or
            ranger_copies + lele + other_basics > deck_size):
        raise ValueError("Invalid deck or setup counts")

    other = deck_size - ranger_copies - lele - other_basics
    eligible = (comb(deck_size, opening)
                - comb(deck_size - lele - other_basics, opening))
    if eligible == 0:
        raise ValueError("No legal Basic-containing openings")

    # Given no Ranger in the first seven, all R remain among 53 cards.
    remaining = deck_size - opening
    entirely_prized = (
        Fraction(comb(prizes, ranger_copies),
                 comb(remaining, ranger_copies))
        if ranger_copies <= prizes else Fraction(0)
    )
    available_after_prizes = 1 - entirely_prized

    direct = 0
    wonder = Fraction(0)
    for r in range(ranger_copies + 1):
        for l in range(lele + 1):
            for b in range(other_basics + 1):
                n = opening - r - l - b
                if not 0 <= n <= other or l + b == 0:
                    continue
                ways = (comb(ranger_copies, r) * comb(lele, l) *
                        comb(other_basics, b) * comb(other, n))
                if r:
                    direct += ways
                elif l and (b or l >= 2):
                    wonder += ways * available_after_prizes

    return {
        "ranger_copies": ranger_copies,
        "valid_opening_probability": Fraction(eligible, comb(deck_size, opening)),
        "direct_given_valid": Fraction(direct, eligible),
        "wonder_tag_given_valid": wonder / eligible,
        "combined_given_valid": (direct + wonder) / eligible,
    }
