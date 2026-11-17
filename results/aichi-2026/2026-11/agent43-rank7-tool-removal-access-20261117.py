#!/usr/bin/env python3
"""Exact natural-draw access to rank-7 Snorlax Stall's named Tool removers.

This measures response-card availability in hand, not actual card use, Tool
removal, match outcome, or win rate. It conditions on a valid opening seven.
"""
from fractions import Fraction
from math import comb

# Rank 7: Faba x2, Field Blower x1, Megaton Blower x1, 12 Basic Pokémon.
TOTAL = (2, 1, 1, 12, 44)  # Faba, Field Blower, Megaton Blower, Basics, Other


def compositions(n, limits):
    amax, fmax, mmax, bmax, omax = limits
    for a in range(min(amax, n) + 1):
        for f in range(min(fmax, n - a) + 1):
            for m in range(min(mmax, n - a - f) + 1):
                for b in range(min(bmax, n - a - f - m) + 1):
                    o = n - a - f - m - b
                    if 0 <= o <= omax:
                        yield (a, f, m, b, o)


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
        "faba1": 0, "field_blower1": 0, "megaton_blower1": 0, "any1": 0,
        "faba2": 0, "field_blower2": 0, "megaton_blower2": 0, "any2": 0,
    }

    for opening in compositions(7, TOTAL):
        if opening[3] == 0:
            continue
        opening_weight = choose_weight(TOTAL, opening)
        after_opening = tuple(t - x for t, x in zip(TOTAL, opening))

        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))

            for draw1_category, draw1_count in enumerate(after_prizes):
                if draw1_count == 0:
                    continue
                draw1 = [0] * 5
                draw1[draw1_category] = 1
                after_draw1 = list(after_prizes)
                after_draw1[draw1_category] -= 1

                for draw2_category, draw2_count in enumerate(after_draw1):
                    if draw2_count == 0:
                        continue
                    draw2 = [0] * 5
                    draw2[draw2_category] = 1
                    weight = opening_weight * prize_weight * draw1_count * draw2_count
                    denominator += weight

                    hand1 = [opening[i] + draw1[i] for i in range(5)]
                    hand2 = [hand1[i] + draw2[i] for i in range(5)]

                    events = {
                        "faba1": hand1[0] >= 1,
                        "field_blower1": hand1[1] >= 1,
                        "megaton_blower1": hand1[2] >= 1,
                        "any1": hand1[0] + hand1[1] + hand1[2] >= 1,
                        "faba2": hand2[0] >= 1,
                        "field_blower2": hand2[1] >= 1,
                        "megaton_blower2": hand2[2] >= 1,
                        "any2": hand2[0] + hand2[1] + hand2[2] >= 1,
                    }
                    for key, event in events.items():
                        totals[key] += weight * int(event)

    valid_opening_sevens = comb(60, 7) - comb(48, 7)
    expected_denominator = valid_opening_sevens * comb(53, 6) * 47 * 46
    assert denominator == expected_denominator
    assert totals["any1"] <= totals["any2"]

    print("Rank-7 Snorlax Stall natural Tool-removal response access")
    print(f"Valid-opening probability (12 Basics): {pct(valid_opening_sevens, comb(60, 7))}")
    print()
    print("Opponent response window          Faba       Field Blower  Megaton Blower  Any")
    print(
        f"After one normal draw:            {pct(totals['faba1'], denominator):>10} "
        f"{pct(totals['field_blower1'], denominator):>14} "
        f"{pct(totals['megaton_blower1'], denominator):>15} "
        f"{pct(totals['any1'], denominator):>10}"
    )
    print(
        f"After two normal draws:           {pct(totals['faba2'], denominator):>10} "
        f"{pct(totals['field_blower2'], denominator):>14} "
        f"{pct(totals['megaton_blower2'], denominator):>15} "
        f"{pct(totals['any2'], denominator):>10}"
    )
    print()
    print("Exact union fractions:")
    print(f"after_one_draw: {Fraction(totals['any1'], denominator)}")
    print(f"after_two_draws: {Fraction(totals['any2'], denominator)}")


if __name__ == "__main__":
    run()
