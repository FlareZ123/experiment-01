#!/usr/bin/env python3
"""Exact conditional initial-six-Prize role feasibility, not an attack or win model.

Compares New Moon Dusknoir v3 with one conceptual fixed-60 swap:
  -1 Ace Trainer (2 -> 1), +1 Gladion (0 -> 1).
The rescue variant only treats an unprized Gladion as *physically able* to
retrieve a Prized Dusknoir. It does NOT presume you can draw, search, play
the Supporter through a lock, win the matchup, or take 99.5% of games.
No opponent game is launched. Python stdlib only.
"""
from fractions import Fraction
from math import comb

BASE = [
    ("Duskull", 2, True), ("Dusclops", 2, False),
    ("Dusknoir", 1, False), ("Mewtwo", 2, True),
    ("TrevGX", 1, True), ("Ace", 2, False),
    ("otherBasic", 12, True), ("otherNonbasic", 38, False),
]
GLADION = [
    ("Duskull", 2, True), ("Dusclops", 2, False),
    ("Dusknoir", 1, False), ("Mewtwo", 2, True),
    ("TrevGX", 1, True), ("Ace", 1, False),
    ("Gladion", 1, False), ("otherBasic", 12, True),
    ("otherNonbasic", 38, False),
]

def prize_compositions(counts, left):
    if len(counts) == 1:
        if 0 <= left <= counts[0]:
            yield (left,)
        return
    for taken in range(min(counts[0], left) + 1):
        for tail in prize_compositions(counts[1:], left - taken):
            yield (taken,) + tail

def exact(cats):
    assert sum(n for _, n, _ in cats) == 60
    assert sum(n for _, n, basic in cats if basic) == 17
    totals = [n for _, n, _ in cats]
    weights = [0] * 5
    denominator = 0
    for prize in prize_compositions(totals, 6):
        basic_prized = sum(p for p, (_, _, basic) in zip(prize, cats) if basic)
        # Reverse the uniform disjoint seven-hand, six-Prize draw order:
        # for each specific Prize set there are this many legal basic hands.
        legal_hands = comb(54, 7) - comb(37 + basic_prized, 7)
        weight = legal_hands
        for n, p in zip(totals, prize):
            weight *= comb(n, p)
        unprized = {name: n-p for (name, n, _), p in zip(cats, prize)}
        core = unprized["Duskull"] >= 1 and unprized["Dusclops"] >= 1
        can_rescue = (unprized["Dusknoir"] >= 1 or
                      unprized.get("Gladion", 0) >= 1)
        stage = core and can_rescue
        night = stage and unprized["Mewtwo"] >= 1 and unprized["TrevGX"] >= 1
        events = (stage, night, night and unprized["Ace"] >= 1,
                  unprized["Ace"] >= 1, unprized["Dusknoir"] >= 1)
        denominator += weight
        for i, good in enumerate(events):
            if good:
                weights[i] += weight
    expected_den = (comb(60, 7) - comb(43, 7)) * comb(53, 6)
    assert denominator == expected_den
    return tuple(Fraction(x, denominator) for x in weights)

labels = [
    "Duskull+Dusclops+recoverable Dusknoir",
    "plus Mewtwo and Night Watch GX donor",
    "above plus >=1 Ace Trainer physically available",
    ">=1 Ace Trainer physically unprized",
    ">=1 Dusknoir physically unprized",
]
base, rescue = exact(BASE), exact(GLADION)
expected_base = (
    Fraction(13813723731137, 15627986902094),
    Fraction(24614475913803, 31255973804188),
    Fraction(634024466607825, 812655318908888),
    Fraction(28793488, 29041933),
    Fraction(26123935, 29041933),
)
expected_rescue = (
    Fraction(121864218190441, 125023895216752),
    Fraction(271940863237941, 312559738041880),
    Fraction(634024466607825, 812655318908888),
    Fraction(26123935, 29041933),
    Fraction(26123935, 29041933),
)
assert base == expected_base and rescue == expected_rescue
for label, before, after in zip(labels, base, rescue):
    print(f"{label}: baseline={float(before):.10%}, "
          f"Gladion={float(after):.10%}, delta={float(after-before)*100:+.8f} pp")
