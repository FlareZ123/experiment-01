#!/usr/bin/env python3
"""Exact uniform-opening probability of rank-2 starting Basic order failures.

Primary source: results/aichi-2026/full-decklists.json, authenticated rank 2.
No simulator or games are used. Calculation is conditional on normal seven-card
shuffle and uniformly random within-hand order; assumes the old native choice
selector's first selected Basic is Active and the old policy used choice order.
"""
from __future__ import annotations

from fractions import Fraction
from itertools import product
from json import loads
from math import comb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASIC_NAMES = frozenset({
    "Pidgey", "Oddish", "Lillipup", "Bunnelby", "Fan Rotom",
    "Relicanth", "Mr. Mime", "Girafarig", "Budew", "Jirachi",
})


def exact_probabilities(path: Path = ROOT / "results/aichi-2026/full-decklists.json"):
    records = loads(path.read_text(encoding="utf-8"))["decks"]
    deck = next(row for row in records if row["rank"] == 2)
    cards = deck["cards"]
    total = sum(card["count"] for card in cards)
    assert total == 60, total
    other = sum(card["count"] for card in cards
                if card["name"] in BASIC_NAMES and card["name"] != "Bunnelby")
    bunnelby = sum(card["count"] for card in cards if card["name"] == "Bunnelby")
    assert (bunnelby, other) == (2, 12), (bunnelby, other)
    nonbasic = total - bunnelby - other
    n = 7
    denom = comb(total, n)
    def hypergeom(b, o):
        rest = n - b - o
        if rest < 0 or rest > nonbasic:
            return Fraction()
        return Fraction(comb(bunnelby, b)*comb(other, o)*
                        comb(nonbasic, rest), denom)

    # Among b Bunnelby and o other Basics in a random hand ordering, the
    # probability the earliest Basic is not Bunnelby is o/(b+o).
    old_not_bunnelby = sum(
        (hypergeom(b, o)*Fraction(o, b+o) for b in range(1, bunnelby+1)
         for o in range(other+1) if b+o <= n), Fraction()
    )
    p_no_basic = Fraction(comb(nonbasic, n), denom)
    p_full_bench = sum(
        (Fraction(comb(bunnelby+other, k)*comb(nonbasic, n-k), denom)
         for k in range(6, 8)), Fraction()
    )
    # Source line-specific direct-opening funding: one Budew and at least
    # one Bunnelby, with TM Evolution, an attachable Energy, and a compatible
    # first-turn Bench evolution target (Oddish/Lillipup/Pidgey/Fan Rotom).
    # Fan Rotom can fetch Colorless Pidgey/Lillipup with its first-turn Ability.
    # Counts are disjoint categories in the authenticated rank-2 60.
    budew_count = sum(c["count"] for c in cards if c["name"] == "Budew")
    tm_count = sum(c["count"] for c in cards
                   if c["name"] == "Technical Machine: Evolution")
    energy_count = sum(c["count"] for c in cards if c["category"] == "Energy")
    target_count = sum(c["count"] for c in cards if c["name"] in
                       {"Oddish", "Lillipup", "Pidgey", "Fan Rotom"})
    assert (budew_count, tm_count, energy_count, target_count) == (1,2,6,7)
    remaining = total - sum((budew_count, bunnelby,
                             tm_count, energy_count, target_count))
    direct_funded = Fraction()
    direct_unfunded = Fraction()
    for bu in range(1, budew_count+1):
        for bn in range(1, bunnelby+1):
            for tm in range(tm_count+1):
                for en in range(energy_count+1):
                    for tg in range(target_count+1):
                        rest = n-bu-bn-tm-en-tg
                        if not 0 <= rest <= remaining:
                            continue
                        count = (comb(budew_count,bu)*comb(bunnelby,bn)*
                                 comb(tm_count,tm)*comb(energy_count,en)*
                                 comb(target_count,tg)*comb(remaining,rest))
                        probability = Fraction(count,denom)
                        if tm>0 and en>0 and tg>0:
                            direct_funded += probability
                        else:
                            direct_unfunded += probability
    return {
        "total":total, "bunnelby":bunnelby, "other_basic":other,
        "no_basic":p_no_basic, "old_not_bunnelby":old_not_bunnelby,
        "old_not_bunnelby_given_valid":old_not_bunnelby/(1-p_no_basic),
        "old_start_full_bench":p_full_bench,
        "budew_bunnelby_funded_direct":direct_funded,
        "budew_bunnelby_unfunded_direct":direct_unfunded,
    }


if __name__ == "__main__":
    result = exact_probabilities()
    for key, value in result.items():
        if isinstance(value, Fraction):
            print(f"{key}: {float(value):.9%} ({value})")
        else:
            print(f"{key}: {value}")
    assert round(float(result["old_not_bunnelby"]), 8) == 0.09841045
    assert round(float(result["old_start_full_bench"]), 8) == 0.00036657
    assert round(float(result["budew_bunnelby_unfunded_direct"]), 8) == 0.02220334
    assert round(float(result["budew_bunnelby_funded_direct"]), 8) == 0.00050268
