#!/usr/bin/env python3
"""Exact Energy-in-deck feasibility for rank-1 BC -> VS Seeker -> Raihan.

The model assumes the first-turn-KO branch, preserves Field Blower, and
reserves Battle Compressor / VS Seeker for the response. It is not a game
simulator or matchup estimator.
"""
from fractions import Fraction
from functools import lru_cache
from itertools import product
from math import comb, factorial

CANDIDATE_BASICS = 14
OPPONENT_BASICS = 14
ENERGY_COPIES = 11
K_MAX = 10
CARD_NAMES = (
    "field_blower", "battle_compressor", "vs1", "vs2", "vs3",
    "teammates", "raihan",
)
OPENING, PRIZES, DRAWS, DECK = range(4)
N_SPECIAL = len(CARD_NAMES)
N_OTHER = 60 - N_SPECIAL  # 14 Basics + 11 Energy + 28 other non-Basics
N_OTHER_NONBASIC = 46 - N_SPECIAL
N_WITHOUT_ENERGY = N_OTHER - ENERGY_COPIES  # 14 Basics + 28 other non-Basics
N_WITHOUT_ENERGY_NONBASIC = N_OTHER_NONBASIC - ENERGY_COPIES
VALID_OPENINGS = comb(60, 7) - comb(46, 7)


@lru_cache(None)
def choose(n, k):
    return comb(n, k) if 0 <= k <= n else 0


def multinomial_energy(opening, prizes, draws, deck):
    if min(opening, prizes, draws, deck) < 0:
        return 0
    if opening + prizes + draws + deck != ENERGY_COPIES:
        return 0
    return factorial(ENERGY_COPIES) // (
        factorial(opening) * factorial(prizes) * factorial(draws) * factorial(deck)
    )


def energy_no_deck_weight(open_slots, prize_slots, draw_slots):
    """Count completions where all 11 Basic Energy are outside the deck."""
    total = 0
    for energy_open in range(ENERGY_COPIES + 1):
        for energy_prizes in range(ENERGY_COPIES - energy_open + 1):
            energy_draws = ENERGY_COPIES - energy_open - energy_prizes
            energy_deck = 0
            other_open = open_slots - energy_open
            other_prizes = prize_slots - energy_prizes
            other_draws = draw_slots - energy_draws
            if min(other_open, other_prizes, other_draws) < 0:
                continue

            # The remaining 42 cards contain 14 Basics and 28 other cards.
            valid_openings = (
                choose(N_WITHOUT_ENERGY, other_open)
                - choose(N_WITHOUT_ENERGY_NONBASIC, other_open)
            )
            if not valid_openings:
                continue
            after_opening = N_WITHOUT_ENERGY - other_open
            prize_ways = choose(after_opening, other_prizes)
            after_prizes = after_opening - other_prizes
            draw_ways = choose(after_prizes, other_draws)
            total += (
                multinomial_energy(energy_open, energy_prizes, energy_draws, energy_deck)
                * valid_openings
                * prize_ways
                * draw_ways
            )
    return total


def paired_bonus_distribution():
    q = Fraction(choose(46, 7), choose(60, 7))
    p = 1 - q
    denominator = 1 - q * q
    probabilities = [1 - (p * q / denominator)]
    for m in range(1, K_MAX + 1):
        probabilities.append(p * p * q**m / denominator)
    residual = p * q ** (K_MAX + 1) / denominator
    assert sum(probabilities) + residual == 1
    return probabilities, residual


@lru_cache(None)
def probability_for_draw_count(draw_count):
    denominator = VALID_OPENINGS * choose(53, 6) * choose(47, draw_count)
    totals = [0] * 7
    # total, baseline, BC/VS->Teammates, BC/VS->Raihan (ungated/gated),
    # and the two unions.

    for zones in product(range(4), repeat=N_SPECIAL):
        opening_special = zones.count(OPENING)
        prize_special = zones.count(PRIZES)
        draw_special = zones.count(DRAWS)
        open_slots = 7 - opening_special
        prize_slots = 6 - prize_special
        draw_slots = draw_count - draw_special
        if min(open_slots, prize_slots, draw_slots) < 0:
            continue

        valid_openings = (
            choose(N_OTHER, open_slots)
            - choose(N_OTHER_NONBASIC, open_slots)
        )
        if not valid_openings:
            continue
        after_opening = N_OTHER - open_slots
        total_weight = (
            valid_openings
            * choose(after_opening, prize_slots)
            * choose(after_opening - prize_slots, draw_slots)
        )
        if not total_weight:
            continue

        z = dict(zip(CARD_NAMES, zones))
        seen = lambda name: z[name] in (OPENING, DRAWS)
        fb_available = z["field_blower"] != PRIZES
        teammates_available = z["teammates"] != PRIZES
        raihan_available = z["raihan"] != PRIZES
        bc_seen = seen("battle_compressor")
        vs_seen = any(seen(f"vs{i}") for i in (1, 2, 3))

        baseline = seen("field_blower") or (
            fb_available and (seen("teammates") or seen("raihan"))
        )
        bc_teammates = (
            fb_available and teammates_available and bc_seen and vs_seen
        )
        bc_raihan_without_energy_gate = (
            fb_available and raihan_available and bc_seen and vs_seen
        )

        no_energy_in_deck = energy_no_deck_weight(
            open_slots, prize_slots, draw_slots
        )
        assert 0 <= no_energy_in_deck <= total_weight
        energy_in_deck_weight = total_weight - no_energy_in_deck
        bc_raihan_with_energy_gate = (
            bc_raihan_without_energy_gate and energy_in_deck_weight > 0
        )

        totals[0] += total_weight
        if baseline:
            totals[1] += total_weight
        if bc_teammates:
            totals[2] += total_weight
        if bc_raihan_without_energy_gate:
            totals[3] += total_weight
        if bc_raihan_with_energy_gate:
            totals[4] += energy_in_deck_weight
        if baseline or bc_teammates:
            totals[5] += total_weight
        elif bc_raihan_with_energy_gate:
            totals[6] += energy_in_deck_weight

    assert totals[0] == denominator, (draw_count, totals[0], denominator)
    return tuple(Fraction(value, denominator) for value in totals[1:])


def integrate():
    probabilities, residual = paired_bonus_distribution()
    integrated = [Fraction(0) for _ in range(6)]
    for bonus_cards, probability in enumerate(probabilities):
        values = probability_for_draw_count(2 + bonus_cards)
        for i, value in enumerate(values):
            integrated[i] += probability * value
    return integrated, residual


def percent(value):
    return f"{float(value) * 100:.9f}%"


def main():
    values, residual = integrate()
    baseline, bc_teammates, bc_raihan_no_energy, bc_raihan_energy, union_teammates, union_energy = values
    labels = (
        "baseline direct Field Blower or direct Teammates/Raihan",
        "BC/VS -> Teammates route event",
        "BC/VS -> Raihan route event without Energy gate",
        "BC/VS -> Raihan route event with Energy in deck",
        "union: baseline + BC/VS -> Teammates",
        "union: baseline + BC/VS -> Teammates/Raihan with Energy in deck",
    )
    for label, value in zip(labels, values):
        print(f"{label}: {percent(value)} .. {percent(value + residual)}")

    print("net exact Raihan-enabled increment over baseline:", percent(union_energy - baseline))
    print("Raihan route has Energy in deck:", f"{float(bc_raihan_energy / bc_raihan_no_energy) * 100:.12f}%")
    print("Raihan route lacks Energy in deck:", f"{float((bc_raihan_no_energy - bc_raihan_energy) / bc_raihan_no_energy) * 100:.12f}%")
    print("Raihan added beyond Teammates union (percentage points):", f"{float(union_energy - union_teammates) * 100:.12f}")
    print("mulligan-tail residual:", f"{float(residual):.12e}")

    # Reproduce the existing baseline and the original BC/VS union.
    assert abs(float(baseline) * 100 - 35.668392889) < 1e-8
    assert abs(float(union_teammates) * 100 - 38.389926013) < 1e-8
    assert union_energy >= union_teammates >= baseline


if __name__ == "__main__":
    main()
