"""Exact early hand predicate for the rank-8 autonomous Tool-Garbodor policy.

Counts derive from the rank-8 published source 60 and the designated names in
simulation/twinleaf/rank8-boostshake-autonomous-policy.cjs. Restriction: one
normal draw after a Basic-valid seven, no opponent mulligan bonus, no extra
draw/search or Prized-target constraints. This is NOT a gameplay frequency.
"""
from fractions import Fraction
from itertools import product
from math import comb
from pathlib import Path
import json

SOURCE = Path(__file__).resolve().parents[1] / "results" / "aichi-2026" / "full-decklists.json"
PRIORITIES = (
    "Dark Patch", "VS Seeker", "Iono", "Darkness Energy",
    "Battle Compressor", "Field Blower", "N", "Pokémon Ranger"
)


def source_categories():
    """Use actual registered ranks and explicitly check disjoint categories."""
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    rank8 = next(deck for deck in data["decks"] if deck["rank"] == 8)
    cards = rank8["cards"]
    counts = {card["name"]: card["count"] for card in cards}
    assert sum(counts.values()) == 60
    assert counts["Garbodor"] == 2  # Sole non-Basic Pokémon in this 60.
    basic = sum(c["count"] for c in cards if c["category"] == "Pokémon") - 2
    core = (counts["Secret Box"], counts["Boost Shake"], counts["Float Stone"])
    disposable = tuple(counts.get(name, 0) for name in PRIORITIES)
    other = 60 - basic - sum(core) - sum(disposable)
    assert (basic, core, disposable, other) == (
        10, (1, 1, 4), (4, 3, 1, 5, 2, 1, 0, 0), 28)
    return basic, core, disposable, other


def exact(allow_same_name_duplicates=False):
    """Enumerate unordered first-eight compositions with opener-position correction.

    The first normal draw can be taken after setting six random Prizes without
    changing its joint distribution with the original seven.
    """
    basic, (secret, shake, stones), disposables, other = source_categories()
    valid7 = Fraction(comb(60, 7) - comb(60 - basic, 7), comb(60, 7))
    favorable_and_valid7 = Fraction(0)
    for picks in product(*(range(n + 1) for n in disposables)):
        if ((sum(picks) if allow_same_name_duplicates
             else sum(n > 0 for n in picks)) < 3):
            continue
        d = sum(picks)
        multiplicity = 1
        for total, selected in zip(disposables, picks):
            multiplicity *= comb(total, selected)
        for f in range(1, stones + 1):
            for b in range(1, min(basic, 8) + 1):
                o = 8 - secret - shake - f - d - b
                if o < 0 or o > other:
                    continue
                ways = (multiplicity * comb(stones, f) *
                        comb(basic, b) * comb(other, o))
                # When eight seen include exactly one Basic, it occupies the
                # initial seven at 7/8 of the randomly ordered positions.
                initial_valid_fraction = Fraction(7, 8) if b == 1 else 1
                favorable_and_valid7 += (
                    Fraction(ways, comb(60, 8)) * initial_valid_fraction
                )
    return {
        "valid_start_seven": valid7,
        "all_held_and_valid_start": favorable_and_valid7,
        "conditional_on_valid_start": favorable_and_valid7 / valid7
    }


def paired_unique_core_probability(total, basic_count, opener=7):
    """Two named singleton Items among the opener plus one normal draw.

    The two singleton cards are non-Basic. Count the first `opener` cards as
    an unordered starting hand and the next draw as one of the remaining cards.
    Six random Prize cards dealt between those steps do not alter the marginal
    first-draw distribution. The starting hand must contain a Basic.
    All card effects, other needed cards and real-game locks remain excluded.
    """
    remaining = total - opener
    other_nonbasic = total - 2 - basic_count
    valid_opener = comb(total, opener) - comb(total - basic_count, opener)

    # Both unique Items are in the opener; the normal draw is any remaining
    # card. The other opener cards must include at least one Basic.
    both_in_opener = remaining * (
        comb(total - 2, opener - 2)
        - comb(other_nonbasic, opener - 2)
    )
    # Exactly one unique Item is in the opener and the other is next drawn.
    one_then_draw = 2 * (
        comb(total - 2, opener - 1)
        - comb(other_nonbasic, opener - 1)
    )
    favorable = both_in_opener + one_then_draw
    all_deals = comb(total, opener) * remaining
    valid_deals = valid_opener * remaining
    return {
        "valid_start_seven": Fraction(valid_opener, comb(total, opener)),
        "all_held_and_valid_start": Fraction(favorable, all_deals),
        "conditional_on_valid_start": Fraction(favorable, valid_deals),
        "favorable_start_draw_pairs": favorable,
        "valid_start_draw_pairs": valid_deals,
    }


def rank8_flexible_box_shake_ceiling():
    """Source-locked hand-only ceiling before owner deck search and payment."""
    basic, (box, shake, _), _, _ = source_categories()
    assert (box, shake) == (1, 1)
    return paired_unique_core_probability(60, basic)


if __name__ == "__main__":
    for mode in (False, True):
        print("allow_same_name_duplicates:", mode)
        for name, value in exact(mode).items():
            print(f"{name}: {value} = {float(value):.12%}")
    print("flexible Box + Shake hand-only ceiling:")
    for name, value in rank8_flexible_box_shake_ceiling().items():
        print(f"{name}: {value} = {float(value):.12%}" if isinstance(value, Fraction)
              else f"{name}: {value}")
    print("Interpretation: structural initial-eight opportunities, not gameplay rates.")
