#!/usr/bin/env python3
"""Exact Gladion recovery sensitivity for Sentinel Whismur double-lock v2.

This is a card-access / Prize-zone calculation only. It does not simulate a game,
opponent interaction, or complete lock assembly.
"""
from fractions import Fraction
from math import comb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DECK_PATH = ROOT / "results/aichi-2026/candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv"


def read_deck():
    rows = []
    for line in DECK_PATH.read_text(encoding="utf-8").splitlines():
        category, name, set_code, number, quantity = line.split("|")
        rows.append((category, name, set_code, number, int(quantity)))

    def qty(category, name, set_code=None, number=None):
        found = [
            r[4] for r in rows
            if r[0] == category and r[1] == name
            and (set_code is None or r[2] == set_code)
            and (number is None or r[3] == number)
        ]
        assert len(found) == 1, (category, name, set_code, number, found)
        return found[0]

    assert sum(r[4] for r in rows) == 60
    assert qty("Pokémon", "Whismur", "CES", "116") == 1
    assert qty("Trainer", "Grand Tree", "SCR", "136") == 1
    assert qty("Trainer", "Rare Candy", "SVI", "191") == 2
    assert qty("Pokémon", "Stoutland", "BCR", "122") == 2
    assert qty("Trainer", "Gladion", "CIN", "95") == 1
    assert qty("Energy", "Jet Energy", "PAL", "190") == 3
    assert qty("Pokémon", "Fan Rotom", "SCR", "118") == 1
    assert qty("Energy", "Capture Energy", "RCL", "171") == 2
    assert qty("Energy", "Grass Energy", "MEE", "9") == 1
    assert qty("Trainer", "Guzma & Hala", "CEC", "193") == 4
    assert qty("Trainer", "Tag Call", "CEC", "206") == 4

    basics = [
        "Buneary", "Fan Rotom", "Girafarig", "Lillipup",
        "Oddish", "Pidgey", "Relicanth", "Whismur",
    ]
    basic_count = sum(qty("Pokémon", name) for name in basics)
    assert basic_count == 13
    return basic_count


def compositions(capacity, left, index=0, prefix=()):
    if index == len(capacity) - 1:
        if 0 <= left <= capacity[index]:
            yield prefix + (left,)
        return
    for n in range(min(left, capacity[index]) + 1):
        yield from compositions(capacity, left - n, index + 1, prefix + (n,))


def choose_product(capacity, vector):
    out = 1
    for n, k in zip(capacity, vector):
        out *= comb(n, k)
    return out


def first_turn_gladion_whismur_rescue(basic_count):
    # Categories: Whismur, Fan Rotom, Jet, Capture, Grass, other Basic,
    # Guzma & Hala, Tag Call, Gladion, all remaining cards.
    capacity = [1, 1, 3, 2, 1, basic_count - 2, 4, 4, 1, 32]
    assert sum(capacity) == 60
    valid_openings = comb(60, 7) - comb(60 - basic_count, 7)
    denominator = valid_openings * comb(53, 7) * 7
    numerator = 0

    for opening in compositions(capacity, 7):
        # Opening must contain a Basic; Whismur and Fan Rotom are separate.
        if opening[0] + opening[1] + opening[5] == 0:
            continue
        opening_ways = choose_product(capacity, opening)
        remaining = [n - k for n, k in zip(capacity, opening)]

        for prize_plus_draw in compositions(remaining, 7):
            # Whismur is in the six Prize cards, not the first natural draw.
            if prize_plus_draw[0] == 0:
                continue
            seven_ways = choose_product(remaining, prize_plus_draw)

            # The seventh selected card is the first-turn draw. Gladion and
            # Jet must both be in the opening hand plus that draw.
            for draw_category in range(1, len(capacity)):
                draw_ways = prize_plus_draw[draw_category]
                if not draw_ways:
                    continue
                has_gladion = opening[8] > 0 or draw_category == 8
                has_jet = opening[2] > 0 or draw_category == 2
                if has_gladion and has_jet:
                    numerator += opening_ways * seven_ways * draw_ways

    return Fraction(numerator, denominator)


def named_piece_prize_recovery(basic_count, bawl_rescue):
    # Prize categories: Whismur (1), the other five line-critical cards,
    # Gladion (1), Jet Energy (3), other Basic Pokémon (12), other cards (38).
    capacity = [
        1, 5, 1, 3, basic_count - 1,
        60 - 1 - 5 - 1 - 3 - (basic_count - 1),
    ]
    assert capacity == [1, 5, 1, 3, 12, 38]

    valid_openings = comb(60, 7) - comb(60 - basic_count, 7)
    denominator = valid_openings * comb(53, 6)
    no_key_prized = 0
    one_non_whismur_key_prized = 0
    one_non_whismur_key_gladion_opening = 0
    whismur_only_key_prized = 0

    for opening in compositions(capacity, 7):
        # Whismur and the 12 other Basics are the 13 starting Basics.
        if opening[0] + opening[4] == 0:
            continue
        opening_ways = choose_product(capacity, opening)
        remaining = [n - k for n, k in zip(capacity, opening)]

        for prizes in compositions(remaining, 6):
            ways = opening_ways * choose_product(remaining, prizes)
            prized_whismur, prized_other_keys, prized_gladion, *_ = prizes

            if prized_whismur + prized_other_keys == 0:
                no_key_prized += ways

            if prized_whismur == 0 and prized_gladion == 0 and prized_other_keys == 1:
                one_non_whismur_key_prized += ways
                if opening[2] > 0:
                    one_non_whismur_key_gladion_opening += ways

            if prized_whismur == 1 and prized_gladion == 0 and prized_other_keys == 0:
                whismur_only_key_prized += ways

    p0 = Fraction(no_key_prized, denominator)
    p_one_other = Fraction(one_non_whismur_key_prized, denominator)
    p_one_other_gladion_open = Fraction(
        one_non_whismur_key_gladion_opening, denominator
    )

    # If Gladion is not in the opening but not Prized, it is in the 47-card
    # post-Prize deck; two natural draws (game turns 2 and 4) see it with 2/47.
    p_one_other_recovered = (
        p_one_other_gladion_open
        + (p_one_other - p_one_other_gladion_open) * Fraction(2, 47)
    )

    p_whismur_only = Fraction(whismur_only_key_prized, denominator)
    p_ideal = p0 + p_one_other + p_whismur_only
    p_natural = p0 + p_one_other_recovered + bawl_rescue

    return {
        "no_key_prized": p0,
        "one_other_key_prized": p_one_other,
        "one_other_key_recovered_by_turn4_natural_draws": p_one_other_recovered,
        "whismur_only_key_prized": p_whismur_only,
        "whismur_recovered_for_bawl_by_turn2": bawl_rescue,
        "natural_draw_only_named_piece_prize_viability": p_natural,
        "ideal_one_gladion_recovery_ceiling": p_ideal,
    }


def show(name, value):
    print(f"{name}: {float(value) * 100:.6f}% ({value.numerator}/{value.denominator})")


def main():
    basic_count = read_deck()
    bawl_rescue = first_turn_gladion_whismur_rescue(basic_count)

    expected_bawl_rescue = Fraction(286160998, 74254775023)
    assert bawl_rescue == expected_bawl_rescue, (bawl_rescue, expected_bawl_rescue)

    prize = named_piece_prize_recovery(basic_count, bawl_rescue)
    expected = {
        "no_key_prized": Fraction(68297525161816, 132544773416055),
        "one_other_key_recovered_by_turn4_natural_draws": Fraction(
            805768980743105, 17442892181552838
        ),
        "whismur_recovered_for_bawl_by_turn2": expected_bawl_rescue,
        "natural_draw_only_named_piece_prize_viability": Fraction(
            49304721137171393, 87214460907764190
        ),
        "ideal_one_gladion_recovery_ceiling": Fraction(
            30082226806367, 35011826940090
        ),
    }
    for key, value in expected.items():
        assert prize[key] == value, (key, prize[key], value)

    print("Whismur-in-Prizes Gladion + Jet Bawl route")
    show("additional first-turn Bawl access", bawl_rescue)
    print("\nTurn-4 double-lock named-piece Prize sensitivity")
    print("(conditional on a valid 13-Basic opening; going second for the Bawl route)")
    for key, value in prize.items():
        show(key, value)


if __name__ == "__main__":
    main()
