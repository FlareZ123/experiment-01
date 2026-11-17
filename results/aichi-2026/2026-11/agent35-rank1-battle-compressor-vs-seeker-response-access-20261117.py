#!/usr/bin/env python3
"""Exact paired-mulligan sensitivity for rank-1 BC -> VS Seeker access.

This is a card-zone access model, not a game simulator or matchup estimate.
"""
from fractions import Fraction
from functools import lru_cache
from itertools import product
from math import comb

CANDIDATE_BASICS = 14
OPPONENT_BASICS = 14
K_MAX = 10
BASE_DRAW_COUNT = 2  # rank 1 has taken its first and second normal draws

# Every distinguished card below is non-Basic. VS Seeker is represented by
# three individually labelled copies so all prize/hand multiplicities count.
CARD_NAMES = (
    "field_blower",
    "battle_compressor",
    "vs_seeker_1",
    "vs_seeker_2",
    "vs_seeker_3",
    "teammates",
    "raihan",
)
OPENING, PRIZES, DRAWS, DECK = range(4)
N_SPECIAL = len(CARD_NAMES)
N_OTHER = 60 - N_SPECIAL
N_OTHER_NONBASIC = 46 - N_SPECIAL
VALID_OPENINGS = comb(60, 7) - comb(46, 7)


@lru_cache(None)
def choose(n, k):
    return comb(n, k) if 0 <= k <= n else 0


def paired_bonus_distribution(opponent_basics, recipient):
    """Exact P(m mulligan bonus cards), m=0..K_MAX, plus residual tail."""
    q_candidate = Fraction(choose(60 - CANDIDATE_BASICS, 7), choose(60, 7))
    q_opponent = Fraction(choose(60 - opponent_basics, 7), choose(60, 7))
    p_candidate, p_opponent = 1 - q_candidate, 1 - q_opponent
    denominator = 1 - q_candidate * q_opponent

    if recipient == "opponent":
        q, p_self, p_other = q_candidate, p_opponent, p_candidate
    elif recipient == "candidate":
        q, p_self, p_other = q_opponent, p_candidate, p_opponent
    else:
        raise ValueError(recipient)

    tail = lambda k: p_self * q**k / denominator
    probabilities = [1 - tail(1)]
    for m in range(1, K_MAX + 1):
        probabilities.append(p_self * p_other * q**m / denominator)
    residual = tail(K_MAX + 1)
    assert sum(probabilities) + residual == 1
    return probabilities, residual


def assignment_flags(zones):
    z = dict(zip(CARD_NAMES, zones))
    seen = lambda card: z[card] in (OPENING, DRAWS)
    fb_not_prized = z["field_blower"] != PRIZES
    teammates_not_prized = z["teammates"] != PRIZES
    raihan_not_prized = z["raihan"] != PRIZES
    bc_seen = seen("battle_compressor")
    vs_seen = any(seen(f"vs_seeker_{i}") for i in (1, 2, 3))

    # Agent43's existing baseline: direct Field Blower, or a directly seen
    # Teammates/Raihan. Raihan is conditional on its Basic-Energy attachment
    # requirement being payable.
    baseline = seen("field_blower") or (
        fb_not_prized and (seen("teammates") or seen("raihan"))
    )

    # BC can put a Teammates still in deck into the discard pile; VS Seeker
    # can recover it. If Teammates is already in hand/discard, this route is
    # also covered. It must not be Prized, and Field Blower must be retained.
    bc_teammates = (
        fb_not_prized and teammates_not_prized and bc_seen and vs_seen
    )

    # Optimistic extension: BC/VS can instead recover Raihan, provided its
    # Basic-Energy attachment requirement is payable at resolution.
    bc_either_supporter = (
        fb_not_prized
        and bc_seen
        and vs_seen
        and (teammates_not_prized or raihan_not_prized)
    )
    return baseline, bc_teammates, bc_either_supporter


@lru_cache(None)
def probability_for_draw_count(draw_count):
    """Exact probabilities conditional on a valid opening seven."""
    denominator = VALID_OPENINGS * choose(53, 6) * choose(47, draw_count)
    totals = [0, 0, 0, 0, 0, 0]
    # baseline, two BC routes, and their two unions

    for zones in product(range(4), repeat=N_SPECIAL):
        opening_special = zones.count(OPENING)
        prize_special = zones.count(PRIZES)
        draw_special = zones.count(DRAWS)

        open_slots = 7 - opening_special
        prize_slots = 6 - prize_special
        draw_slots = draw_count - draw_special
        if min(open_slots, prize_slots, draw_slots) < 0:
            continue

        # Remaining 53 cards contain 14 Basics and 39 non-Basics. The
        # opening completion must contain at least one Basic.
        valid_opening_completions = (
            choose(N_OTHER, open_slots)
            - choose(N_OTHER_NONBASIC, open_slots)
        )
        if not valid_opening_completions:
            continue

        after_opening = N_OTHER - open_slots
        prize_completions = choose(after_opening, prize_slots)
        after_prizes = after_opening - prize_slots
        draw_completions = choose(after_prizes, draw_slots)
        weight = (
            valid_opening_completions
            * prize_completions
            * draw_completions
        )
        if not weight:
            continue

        baseline, bc_teammates, bc_either = assignment_flags(zones)
        totals[0] += weight
        if baseline:
            totals[1] += weight
        if bc_teammates:
            totals[2] += weight
        if bc_either:
            totals[3] += weight
        if baseline or bc_teammates:
            totals[4] += weight
        if baseline or bc_either:
            totals[5] += weight

    # The zone assignments exactly partition the original sample space.
    assert totals[0] == denominator, (draw_count, totals[0], denominator)
    return tuple(Fraction(x, denominator) for x in totals[1:])


def integrate():
    bonus_probabilities, residual = paired_bonus_distribution(
        OPPONENT_BASICS, "opponent"
    )
    integrated = [Fraction(0) for _ in range(5)]
    for bonus_cards, probability in enumerate(bonus_probabilities):
        values = probability_for_draw_count(BASE_DRAW_COUNT + bonus_cards)
        for i, value in enumerate(values):
            integrated[i] += probability * value
    return integrated, residual


def pct(value):
    return f"{float(value) * 100:.9f}%"


def main():
    values, residual = integrate()
    baseline, bc_tm, bc_either, union_tm, union_either = values
    labels = (
        "baseline direct Field Blower or direct Teammates/Raihan",
        "BC -> VS Seeker -> Teammates route (overlaps baseline)",
        "BC -> VS Seeker -> either Supporter (Raihan payable; overlaps)",
        "union: baseline plus BC/VS -> Teammates",
        "union: baseline plus BC/VS -> either Supporter (Raihan payable)",
    )
    for label, value in zip(labels, values):
        print(f"{label}: {pct(value)} .. {pct(value + residual)}")
    print("net increment from Teammates route:", pct(union_tm - baseline))
    print("net increment with Raihan route payable:", pct(union_either - baseline))
    print("mulligan-tail residual:", f"{float(residual) * 100:.12f}%")

    # Reproduce Agent43's existing first-turn-KO direct-supporter baseline.
    assert abs(float(baseline) * 100 - 35.668392889) < 1e-8
    assert union_tm >= baseline
    assert union_either >= union_tm


if __name__ == "__main__":
    main()
