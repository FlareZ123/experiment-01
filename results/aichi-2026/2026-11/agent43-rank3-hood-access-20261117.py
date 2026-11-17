#!/usr/bin/env python3
"""Exact natural-draw access model for Hood Shield v1's rank-3 escape package.

This is a source-dealt resource-access calculation, not a game simulation.
It conditions on a valid opening seven (at least one Basic), then models
six Prizes and one or two normal draws from a uniformly shuffled 60-card list.
"""
from fractions import Fraction
from math import comb

# Candidate Hood Shield Shadow Rider v1, grouped into relevant categories.
# The 42 "other" cards include Guzma and all cards irrelevant to this narrow
# Arven / Field Blower / Stealthy Hood access event.
TOTAL = (1, 1, 2, 14, 42)  # Arven, Field Blower, Hoods, Basics, Other


def compositions(n, limits):
    """Yield bounded nonnegative tuples summing to n."""
    amax, fmax, hmax, bmax, omax = limits
    for a in range(min(amax, n) + 1):
        for f in range(min(fmax, n - a) + 1):
            for h in range(min(hmax, n - a - f) + 1):
                for b in range(min(bmax, n - a - f - h) + 1):
                    o = n - a - f - h - b
                    if 0 <= o <= omax:
                        yield (a, f, h, b, o)


def choose_weight(population, sample):
    """Number of unordered samples with the given category composition."""
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
        "turn1_direct": 0,
        "turn1_arven": 0,
        "turn1_union": 0,
        "turn2_direct": 0,
        "turn2_arven": 0,
        "turn2_union": 0,
        "eri_turn2_direct": 0,
        "eri_turn2_arven": 0,
        "eri_turn2_union": 0,
    }

    # Draw order: opening seven, six Prizes, first normal draw, second normal
    # draw. Every branch is weighted by the number of physical card choices.
    for opening in compositions(7, TOTAL):
        if opening[3] == 0:  # no Basic => mulligan; exclude from conditioning
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

                    field_blower_not_prized = prizes[1] == 0
                    at_least_one_hood_not_prized = prizes[2] < 2

                    # Without Eri: Arven can fetch whichever of Field Blower
                    # and Hood remain in the deck; if both are already in hand,
                    # they can be played directly without Arven.
                    direct1 = (
                        field_blower_not_prized
                        and at_least_one_hood_not_prized
                        and hand1[1] >= 1 and hand1[2] >= 1
                    )
                    arven1 = (
                        field_blower_not_prized
                        and at_least_one_hood_not_prized
                        and hand1[0] >= 1
                    )
                    direct2 = (
                        field_blower_not_prized
                        and at_least_one_hood_not_prized
                        and hand2[1] >= 1 and hand2[2] >= 1
                    )
                    arven2 = (
                        field_blower_not_prized
                        and at_least_one_hood_not_prized
                        and hand2[0] >= 1
                    )

                    # Conservative Eri case: the opponent resolves Eri between
                    # the candidate's first and second turns and discards
                    # Field Blower if it is in the candidate's hand then.
                    # Arven (Supporter) and Hood (Pokémon Tool) are unaffected.
                    field_blower_survives_eri = (
                        field_blower_not_prized
                        and opening[1] == 0
                        and draw1[1] == 0
                    )
                    eri_direct2 = (
                        field_blower_survives_eri
                        and at_least_one_hood_not_prized
                        and draw2[1] == 1
                        and hand2[2] >= 1
                    )
                    eri_arven2 = (
                        field_blower_survives_eri
                        and at_least_one_hood_not_prized
                        and hand2[0] >= 1
                    )

                    events = {
                        "turn1_direct": direct1,
                        "turn1_arven": arven1,
                        "turn1_union": direct1 or arven1,
                        "turn2_direct": direct2,
                        "turn2_arven": arven2,
                        "turn2_union": direct2 or arven2,
                        "eri_turn2_direct": eri_direct2,
                        "eri_turn2_arven": eri_arven2,
                        "eri_turn2_union": eri_direct2 or eri_arven2,
                    }
                    for key, event in events.items():
                        totals[key] += weight * int(event)

    # Every valid opening-seven composition has the same number of possible
    # Prize/draw continuations. This independently checks the denominator.
    valid_opening_sevens = comb(60, 7) - comb(46, 7)
    expected_denominator = valid_opening_sevens * comb(53, 6) * 47 * 46
    assert denominator == expected_denominator

    assert totals["turn1_union"] <= totals["turn2_union"]
    assert totals["eri_turn2_union"] <= totals["turn2_union"]

    # Rank-3 Snorlax Stall has 11 Basic Pokémon and one Eri. Conditional on
    # a valid seven-card opening, Eri is in the opening with this exact
    # probability; if absent, it is the first normal draw with probability
    # 1/53 after the six Prizes are dealt.
    rank3_valid_openings = comb(60, 7) - comb(49, 7)
    eri_opening_and_valid = comb(59, 6) - comb(48, 6)
    eri_opening_given_valid = Fraction(eri_opening_and_valid, rank3_valid_openings)
    eri_by_first_turn = eri_opening_given_valid + (1 - eri_opening_given_valid) * Fraction(1, 53)
    no_eri_access = Fraction(totals["turn2_union"], denominator)
    eri_access = Fraction(totals["eri_turn2_union"], denominator)
    natural_eri_mixture = eri_by_first_turn * eri_access + (1 - eri_by_first_turn) * no_eri_access

    print("Hood Shield v1 rank-3 resource-access model")
    print("Condition: valid opening seven; 14 Basics; six Prizes.")
    print(f"Valid-opening probability: {pct(valid_opening_sevens, comb(60, 7))}")
    print()
    print("Event                              Probability")
    print(f"First own turn, going second:      {pct(totals['turn1_union'], denominator)}")
    print(f"Second own turn, no Eri:           {pct(totals['turn2_union'], denominator)}")
    print(f"Second own turn, Eri worst-case:   {pct(totals['eri_turn2_union'], denominator)}")
    print()
    print("Component breakdown:")
    for label, direct, arven, union in (
        ("First own turn, no Eri", "turn1_direct", "turn1_arven", "turn1_union"),
        ("Second own turn, no Eri", "turn2_direct", "turn2_arven", "turn2_union"),
        ("Second own turn, Eri", "eri_turn2_direct", "eri_turn2_arven", "eri_turn2_union"),
    ):
        overlap = totals[direct] + totals[arven] - totals[union]
        print(
            f"{label}: direct={pct(totals[direct], denominator)}, "
            f"Arven={pct(totals[arven], denominator)}, "
            f"overlap={pct(overlap, denominator)}, "
            f"union={pct(totals[union], denominator)}"
        )

    print()
    print("Rank-3 opponent Eri access (11 Basics, one Eri):")
    print(f"Valid-opening probability: {pct(rank3_valid_openings, comb(60, 7))}")
    print(f"Eri in opening, conditional on valid opening: {pct(eri_opening_given_valid.numerator, eri_opening_given_valid.denominator)}")
    print(f"Eri by opponent's first turn, conditional on valid opening: {pct(eri_by_first_turn.numerator, eri_by_first_turn.denominator)}")
    print(f"Second own turn, natural-Eri mixture: {pct(natural_eri_mixture.numerator, natural_eri_mixture.denominator)}")

    print()
    print("Exact conditional fractions:")
    for key in ("turn1_union", "turn2_union", "eri_turn2_union"):
        print(f"{key}: {Fraction(totals[key], denominator)}")
    print(f"natural_eri_mixture: {natural_eri_mixture}")


if __name__ == "__main__":
    run()
