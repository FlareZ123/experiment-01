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


def exact():
    """Enumerate unordered first-eight compositions with opener-position correction.

    The first normal draw can be taken after setting six random Prizes without
    changing its joint distribution with the original seven.
    """
    basic, (secret, shake, stones), disposables, other = source_categories()
    valid7 = Fraction(comb(60, 7) - comb(60 - basic, 7), comb(60, 7))
    favorable_and_valid7 = Fraction(0)
    for picks in product(*(range(n + 1) for n in disposables)):
        if sum(n > 0 for n in picks) < 3:
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


if __name__ == "__main__":
    for name, value in exact().items():
        print(f"{name}: {value} = {float(value):.12%}")
    print("Interpretation: a narrow initial eight-card hand predicate only.")
