#!/usr/bin/env python3
"""Exact six-Prize structural accessibility gates for New Moon rank-15 counterlines.

Deal seven uniformly, reject hands with zero Basic Pokemon, then set six Prizes
uniformly from the other 53 cards. The event checks unprized copies anywhere
(in hand or remaining deck); it does not model play, search, attachment, turns,
opponent responses, or a win probability. Python >=3.9, no dependencies.
"""
from math import comb
from fractions import Fraction


def compositions(counts, total):
    def go(i, remaining, prefix):
        if i == len(counts) - 1:
            if 0 <= remaining <= counts[i]:
                yield (*prefix, remaining)
            return
        for k in range(min(counts[i], remaining) + 1):
            yield from go(i + 1, remaining-k, (*prefix, k))
    yield from go(0, total, ())


def gate_probability(categories, required):
    assert sum(count for _, count, _ in categories) == 60
    totals = [count for _, count, _ in categories]
    legal_count = favorable = 0
    for hand in compositions(totals, 7):
        if not any(h and basic for h, (_, _, basic) in zip(hand, categories)):
            continue
        hand_weight = 1
        for n, h in zip(totals, hand):
            hand_weight *= comb(n, h)
        left_after_hand = [n-h for n, h in zip(totals, hand)]
        for prizes in compositions(left_after_hand, 6):
            weight = hand_weight
            for n, p in zip(left_after_hand, prizes):
                weight *= comb(n, p)
            legal_count += weight
            unprized = {name: n-p for (name, n, _), p in zip(categories, prizes)}
            if all(unprized[name] >= count for name, count in required.items()):
                favorable += weight
    return Fraction(favorable, legal_count)


base = [
    ("Duskull", 2, True), ("Dusclops", 2, False),
    ("flex", 1, False), ("other basic", 15, True),
    ("other nonbasic", 40, False),
]
hood = [
    ("Clefairy", 1, True), ("flex", 1, False),
    ("other basic", 16, True), ("other nonbasic", 42, False),
]
regidrago = [
    ("Duskull", 2, True), ("Dusclops", 2, False),
    ("Dusknoir", 1, False), ("Mewtwo", 2, True),
    ("TrevGX", 1, True), ("other basic", 12, True),
    ("other nonbasic", 40, False),
]
cases = [
    ("v3 Dusknoir + one Duskull + one Dusclops", base,
     {"flex": 1, "Duskull": 1, "Dusclops": 1}),
    ("v2 Tool Jammer + two Dusclops", base,
     {"flex": 1, "Dusclops": 2}),
    ("v2 including one Duskull", base,
     {"flex": 1, "Duskull": 1, "Dusclops": 2}),
    ("one Hood + one Clefairy (hypothetical)", hood,
     {"flex": 1, "Clefairy": 1}),
    ("v3 Night Watch copier + Dusknoir Regidrago 280 gate", regidrago,
     {"Duskull": 1, "Dusclops": 1, "Dusknoir": 1,
      "Mewtwo": 1, "TrevGX": 1}),
    ("v3 direct TrevGX Night Watch + Dusknoir gate", regidrago,
     {"Duskull": 1, "Dusclops": 1, "Dusknoir": 1, "TrevGX": 1}),
    ("v3 Mewtwo GX Miraculous Duo + Dusknoir 330HP gate", [
        ("Duskull", 2, True), ("Dusclops", 2, False),
        ("Dusknoir", 1, False), ("Mewtwo", 2, True),
        ("other basic", 13, True), ("other nonbasic", 40, False)
    ], {"Duskull": 1, "Dusclops": 1, "Dusknoir": 1, "Mewtwo": 1}),
]
expected = [
    Fraction(13813723731137, 15627986902094),
    Fraction(357273038, 493712861),
    Fraction(11205551264669, 15627986902094),
    Fraction(399484511, 493712861),
    Fraction(24614475913803, 31255973804188),
    Fraction(31045383146866, 39069967255235),
    Fraction(27389106032389, 31255973804188),
]
for (label, categories, required), exact in zip(cases, expected):
    p = gate_probability(categories, required)
    assert p == exact, (label, p, exact)
    print(f"{label}: {100*float(p):.9f}% = {p}")
