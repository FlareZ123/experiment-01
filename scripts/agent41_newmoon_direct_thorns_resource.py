"""Exact direct-source-first New Moon resource line vs four-Basic Iron Thorns.

Counts are verified from the frozen 60-card English-equivalent candidate.
The studied *restricted* route requires Mewtwo & Mew-GX in the first
accepted seven, Canceling Cologne, Battle Compressor and one of six
Psychic-providing Energy cards among the visible seven + all opponent
mulligan bonus cards + next ordinary draw, with Gengar & Mimikyu-GX still
in the post-Prize deck for Battle Compressor. Other search and discard
routes are deliberately excluded.

All arithmetic uses Python Fraction and integer binomial coefficients.
"""
from fractions import Fraction
from itertools import product
from json import loads
from math import comb
from pathlib import Path


MANIFEST = Path(__file__).resolve().parents[1] / (
    "results/als/new-moon-lockbreak-english-proxy-60.json"
)
GROUP_NAMES = (
    "Mewtwo & Mew-GX",
    "Canceling Cologne",
    "Battle Compressor",
    "Telepathic Psychic Energy",
    "Basic Psychic Energy",
    "Gengar & Mimikyu-GX",
)


def frozen_counts():
    """Check the named card counts against the source-aligned frozen list."""
    rows = loads(MANIFEST.read_text(encoding="utf-8"))["entries"]
    named = {row["name_en"]: row["count"] for row in rows}
    assert sum(row["count"] for row in rows) == 60
    assert [named[name] for name in GROUP_NAMES] == [2, 2, 2, 3, 3, 1]
    assert sum(row["count"] for row in rows if row["type"] == "Pokémon") == 19
    assert named["Dusclops"] == 2
    return (2, 2, 2, 6, 1, 47, 17)


def choose(n, k):
    """Binomial count, including physically impossible selections."""
    return comb(n, k) if 0 <= k <= n else 0


def restricted_direct_probability(bonuses):
    """Exact conditional probability for exactly this many bonus draws.

    Seven-card accepted hand contains at least one Mewtwo & Mew-GX.
    Among the next bonuses+1 drawn cards, all three other necessary card
    groups must have appeared. Gengar must remain in the deck after
    six Prize cards have been set and the bonus/ordinary draws are taken.
    """
    mewtwo, cologne, compressor, energy, gengar, other, basics = frozen_counts()
    assert bonuses >= 0
    d = bonuses + 1
    if d > 46:
        return Fraction(0)
    denominator = choose(60, 7) * choose(53, d)
    count = 0
    for mask in range(8):
        excluded = (
            (cologne if mask & 1 else 0)
            + (compressor if mask & 2 else 0)
            + (energy if mask & 4 else 0)
        )
        allowed = 60 - gengar - excluded
        hand_with_mewtwo = choose(allowed, 7) - choose(allowed - mewtwo, 7)
        draw_ways = choose(allowed - 7, d)
        count += (-1 if mask.bit_count() % 2 else 1) * (
            hand_with_mewtwo * draw_ways
        )
    before_prizes = Fraction(count, denominator)
    # Given Gengar absent from the first 7 + d visible cards, it is
    # equally likely to occupy one of the 53-d unobserved locations.
    gengar_unprized = Fraction(47 - d, 53 - d)
    accepted_initial_hand = Fraction(
        choose(60, 7) - choose(60 - basics, 7), choose(60, 7)
    )
    return before_prizes * gengar_unprized / accepted_initial_hand


def source_mulligan_probability(bonuses):
    """Independent geometric mulligans for source's four Basic Pokémon."""
    assert bonuses >= 0
    mulligan = Fraction(choose(56, 7), choose(60, 7))
    return (1 - mulligan) * mulligan**bonuses


def accept_all_source_mulligans():
    """Exact total for taking every optional source-mulligan bonus draw."""
    return sum(
        (
            source_mulligan_probability(m) * restricted_direct_probability(m)
            for m in range(46)
        ),
        Fraction(0),
    )


def independent_direct_count_one_draw():
    """Enumerate initial seven category counts, avoiding inclusion-exclusion.

    Used to cross-check restricted_direct_probability(0) independently.
    """
    m, c, b, e, _g, other, basics = frozen_counts()
    total = 0
    for am, ac, ab, ae in product(range(m + 1), range(c + 1),
                                   range(b + 1), range(e + 1)):
        if am == 0:
            continue
        ao = 7 - am - ac - ab - ae
        if not 0 <= ao <= other:
            continue
        weight = (
            choose(m, am) * choose(c, ac) * choose(b, ab)
            * choose(e, ae) * choose(other, ao)
        )
        absent = [size - count for size, count in (
            (c, ac), (b, ab), (e, ae)
        ) if count == 0]
        if not absent:
            draw_choices = 52  # Every remaining card except Gengar.
        elif len(absent) == 1:
            draw_choices = absent[0]
        else:
            draw_choices = 0
        total += weight * draw_choices
    valid_hands = choose(60, 7) - choose(60 - basics, 7)
    return Fraction(total, valid_hands * 53) * Fraction(46, 52)


def regression():
    assert restricted_direct_probability(0) == Fraction(
        979895887, 243894153334
    )
    assert independent_direct_count_one_draw() == restricted_direct_probability(0)
    assert restricted_direct_probability(1) == Fraction(
        48692358855, 8292401213356
    )
    assert all(
        restricted_direct_probability(m + 1) > restricted_direct_probability(m)
        for m in range(4)
    )
    assert restricted_direct_probability(46) == 0
    # The admitted event is impossible for >=46 optional bonus draws when
    # all six Prizes and one ordinary draw are already removed.
    assert source_mulligan_probability(46) > 0


if __name__ == "__main__":
    regression()
    for bonuses in range(4):
        result = restricted_direct_probability(bonuses)
        print(f"source_mulligan_bonuses={bonuses}: {result} "
              f"({float(result) * 100:.10f}%)")
    result = accept_all_source_mulligans()
    print(f"accept_all_source_mulligans={float(result) * 100:.10f}%")
    print("restricted_resource_opportunity_only=true")
