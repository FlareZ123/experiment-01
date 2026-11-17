#!/usr/bin/env python3
"""Exact natural-draw access to Hood Shield v1's Hood package vs rank 15.

This is a resource-access calculation, not a game simulation. It conditions
on a valid candidate opening seven and models six Prizes and one/two draws.
"""
from fractions import Fraction
from math import comb

# Candidate Hood Shield v1: Arven x1, Stealthy Hood x2, 14 Basic Pokémon.
TOTAL = (1, 2, 14, 43)  # Arven, Hoods, Basics, Other


def compositions(n, limits):
    amax, hmax, bmax, omax = limits
    for a in range(min(amax, n) + 1):
        for h in range(min(hmax, n - a) + 1):
            for b in range(min(bmax, n - a - h) + 1):
                o = n - a - h - b
                if 0 <= o <= omax:
                    yield (a, h, b, o)


def choose_weight(population, sample):
    weight = 1
    for available, selected in zip(population, sample):
        if selected < 0 or selected > available:
            return 0
        weight *= comb(available, selected)
    return weight


def pct(numerator, denominator):
    return f"{100 * float(Fraction(numerator, denominator)):.6f}%"


def run():
    denominator = 0
    totals = {
        "direct1": 0, "arven1": 0, "one_hood1": 0, "two_hoods1": 0,
        "direct2": 0, "arven2": 0, "one_hood2": 0, "two_hoods2": 0,
    }

    for opening in compositions(7, TOTAL):
        if opening[2] == 0:
            continue
        opening_weight = choose_weight(TOTAL, opening)
        after_opening = tuple(t - x for t, x in zip(TOTAL, opening))

        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))

            for draw1_category, draw1_count in enumerate(after_prizes):
                if draw1_count == 0:
                    continue
                draw1 = [0] * 4
                draw1[draw1_category] = 1
                after_draw1 = list(after_prizes)
                after_draw1[draw1_category] -= 1

                for draw2_category, draw2_count in enumerate(after_draw1):
                    if draw2_count == 0:
                        continue
                    draw2 = [0] * 4
                    draw2[draw2_category] = 1
                    weight = opening_weight * prize_weight * draw1_count * draw2_count
                    denominator += weight

                    hand1 = [opening[i] + draw1[i] for i in range(4)]
                    hand2 = [hand1[i] + draw2[i] for i in range(4)]
                    hood_not_all_prized = prizes[1] < 2

                    direct1 = hand1[1] >= 1
                    arven1 = hand1[0] >= 1 and hood_not_all_prized
                    direct2 = hand2[1] >= 1
                    arven2 = hand2[0] >= 1 and hood_not_all_prized

                    # Two Hoods are available if both are already in hand, or
                    # one is in hand and Arven can search the other from deck.
                    two1 = hand1[1] >= 2 or (
                        hand1[1] == 1 and hand1[0] >= 1 and hood_not_all_prized
                    )
                    two2 = hand2[1] >= 2 or (
                        hand2[1] == 1 and hand2[0] >= 1 and hood_not_all_prized
                    )

                    events = {
                        "direct1": direct1,
                        "arven1": arven1,
                        "one_hood1": direct1 or arven1,
                        "two_hoods1": two1,
                        "direct2": direct2,
                        "arven2": arven2,
                        "one_hood2": direct2 or arven2,
                        "two_hoods2": two2,
                    }
                    for key, event in events.items():
                        totals[key] += weight * int(event)

    valid_opening_sevens = comb(60, 7) - comb(46, 7)
    expected_denominator = valid_opening_sevens * comb(53, 6) * 47 * 46
    assert denominator == expected_denominator
    assert totals["one_hood1"] <= totals["one_hood2"]
    assert totals["two_hoods1"] <= totals["two_hoods2"]

    print("Hood Shield v1 rank-15 Tool access model")
    print(f"Valid-opening probability (14 Basics): {pct(valid_opening_sevens, comb(60, 7))}")
    print()
    print("Access event                     First own turn   Second own turn")
    print(
        f"Direct Hood in hand:             {pct(totals['direct1'], denominator):>12} "
        f"{pct(totals['direct2'], denominator):>17}"
    )
    print(
        f"Arven + Hood not all Prized:     {pct(totals['arven1'], denominator):>12} "
        f"{pct(totals['arven2'], denominator):>17}"
    )
    print(
        f"At least one Hood accessible:    {pct(totals['one_hood1'], denominator):>12} "
        f"{pct(totals['one_hood2'], denominator):>17}"
    )
    print(
        f"Two Hoods accessible:            {pct(totals['two_hoods1'], denominator):>12} "
        f"{pct(totals['two_hoods2'], denominator):>17}"
    )
    print()
    print("Exact union fractions:")
    print(f"one_hood_first_turn: {Fraction(totals['one_hood1'], denominator)}")
    print(f"one_hood_second_turn: {Fraction(totals['one_hood2'], denominator)}")
    print(f"two_hoods_first_turn: {Fraction(totals['two_hoods1'], denominator)}")
    print(f"two_hoods_second_turn: {Fraction(totals['two_hoods2'], denominator)}")


if __name__ == "__main__":
    run()
