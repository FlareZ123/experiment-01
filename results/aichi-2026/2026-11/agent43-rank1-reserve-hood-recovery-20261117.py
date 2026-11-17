#!/usr/bin/env python3
"""Exact paired-mulligan reserve-Hood access for Hood Shield Shadow Rider v1.

This is a narrow resource-line model, not a match simulator. It conditions on
valid opening sevens, integrates the exact paired-mulligan bonus distribution,
and models only direct Hood draws plus Arven / VS Seeker. It distinguishes the
first-turn Supporter restriction: the player going first cannot play Arven on
their first turn; the player going second can.

Candidate inventory:
  Stealthy Hood x2, Arven x1, VS Seeker x2, Basic Pokemon x14, Other x41.

For the second-Hood line, assume:
  * the first Hood is attached on the candidate's first turn;
  * Arven is prioritized for the reserve when it is available;
  * if Arven fetched the first Hood, VS Seeker can recover it on turn two;
  * the player draws one normal card at the start of each turn;
  * optional mulligan cards are drawn after the six Prizes are set.

Excluded: Forest Seal Stone, Tapu Lele-GX, Fog Crystal / Mysterious Treasure
access to Lele, Battle Compressor lines, competing Supporters, board/Bench
constraints, opposing disruption, and whether the opponent actually removes
the first Hood. Results are therefore line-specific access sensitivities, not
total deck access or matchup probabilities.
"""
from fractions import Fraction
from functools import lru_cache
from math import comb

CANDIDATE_BASICS = 14
K_MAX = 10
TOTAL = (2, 1, 2, 14, 41)  # Hood, Arven, VS Seeker, Basic, Other


def compositions(n, limits):
    if len(limits) == 1:
        if 0 <= n <= limits[0]:
            yield (n,)
        return
    for x in range(min(limits[0], n) + 1):
        yield from ((x,) + rest for rest in compositions(n - x, limits[1:]))


def choose_weight(population, sample):
    weight = 1
    for available, selected in zip(population, sample):
        if selected < 0 or selected > available:
            return 0
        weight *= comb(available, selected)
    return weight


def percent(value):
    return f"{float(value) * 100:.9f}%"


def paired_candidate_bonus_distribution():
    """P(M=m), where M is candidate's optional draw count from rank-1 mulligans."""
    q = Fraction(comb(60 - CANDIDATE_BASICS, 7), comb(60, 7))
    p = 1 - q
    denominator = 1 - q * q  # both players have 14 Basics
    tail_ge_one = p * q / denominator
    probs = [1 - tail_ge_one]
    probs.extend(p * p * q**m / denominator for m in range(1, K_MAX + 1))
    residual = p * q**(K_MAX + 1) / denominator
    assert sum(probs) + residual == 1
    return probs, residual


@lru_cache(maxsize=None)
def access_for_bonus(mulligan_bonus, candidate_goes_first):
    """Return P(first Hood), P(reserve secured before response), P(reserve by T2).

    The optional cards are drawn after Prizes and before the candidate's first
    turn. One normal draw is then made on turn one and one further normal draw
    is made on turn two. The turn-two draw is integrated conditionally rather
    than enumerated as a separate sample.
    """
    pre_draws = mulligan_bonus + 1
    valid_openings = comb(60, 7) - comb(46, 7)
    denominator = valid_openings * comb(53, 6) * comb(47, pre_draws)

    first_num = 0
    early_num = 0
    reserve_num = Fraction(0)

    for opening in compositions(7, TOTAL):
        if opening[3] == 0:
            continue
        opening_weight = choose_weight(TOTAL, opening)
        after_opening = tuple(t - x for t, x in zip(TOTAL, opening))

        for prizes in compositions(6, after_opening):
            prize_weight = choose_weight(after_opening, prizes)
            after_prizes = tuple(r - p for r, p in zip(after_opening, prizes))

            for pre_draw in compositions(pre_draws, after_prizes):
                draw_weight = choose_weight(after_prizes, pre_draw)
                hand = tuple(opening[i] + pre_draw[i] for i in range(5))
                hoods, arven, vs_seeker = hand[:3]
                hood_deck = 2 - prizes[0] - hoods

                if candidate_goes_first:
                    # Arven cannot be played on the first turn when going first.
                    first_access = hoods >= 1
                    arven_used_for_first = False
                else:
                    first_access = (
                        hoods >= 1
                        or (hoods == 0 and arven >= 1 and hood_deck >= 1)
                    )
                    arven_used_for_first = (
                        hoods == 0 and arven >= 1 and hood_deck >= 1
                    )

                if not first_access:
                    continue

                state_weight = opening_weight * prize_weight * draw_weight
                first_num += state_weight

                reserve_in_hand = max(0, hoods - 1)
                early_reserve = reserve_in_hand >= 1 or (
                    not candidate_goes_first
                    and hoods == 1
                    and arven >= 1
                    and hood_deck >= 1
                )
                if early_reserve:
                    early_num += state_weight
                    reserve_num += state_weight
                    continue

                if arven_used_for_first:
                    # Arven fetched the first Hood. One Hood must remain in deck;
                    # VS Seeker can recover Arven, or the next draw can be Hood
                    # / VS Seeker. The Arven search removes one card from deck.
                    hoods_left = hood_deck - 1
                    if hoods_left >= 1:
                        if vs_seeker >= 1:
                            success = Fraction(1)
                        else:
                            vs_left = 2 - prizes[2] - vs_seeker
                            success = Fraction(hoods_left + vs_left, 46 - pre_draws)
                    else:
                        success = Fraction(0)
                else:
                    # First Hood was in hand. A second Hood is still searchable
                    # if it is not Prized and Arven is available now or on T2.
                    if hood_deck >= 1:
                        if arven >= 1:
                            success = Fraction(1)
                        else:
                            arven_left = 1 - prizes[1] - arven
                            success = Fraction(hood_deck + arven_left, 47 - pre_draws)
                    else:
                        success = Fraction(0)

                assert 0 <= success <= 1
                reserve_num += state_weight * success

    return (
        Fraction(first_num, denominator),
        Fraction(early_num, denominator),
        Fraction(reserve_num, denominator),
    )


def integrate(candidate_goes_first):
    probs, residual = paired_candidate_bonus_distribution()
    first = early = reserve = Fraction(0)
    for bonus, probability in enumerate(probs):
        f, e, r = access_for_bonus(bonus, candidate_goes_first)
        first += probability * f
        early += probability * e
        reserve += probability * r

    # Residual M > K_MAX can add at most its entire probability mass.
    first_upper = first + residual
    early_upper = early + residual
    reserve_upper = reserve + residual
    conditional_lower = reserve / first_upper
    conditional_upper = min(Fraction(1), reserve_upper / first)
    return {
        "first": (first, first_upper),
        "early": (early, early_upper),
        "reserve": (reserve, reserve_upper),
        "conditional": (conditional_lower, conditional_upper),
        "tail": residual,
    }


def show(label, bounds):
    lo, hi = bounds
    print(f"{label}: {percent(lo)} .. {percent(hi)}")


def main():
    print("Paired-mulligan Hood reserve line — Hood Shield Shadow Rider v1")
    print("Conditioned on valid opening sevens; candidate and rank 1 each have 14 Basics.")
    print("Only direct Hood / Arven / VS Seeker access is modeled.")
    print()

    for goes_first, label in (
        (True, "Candidate goes first"),
        (False, "Candidate goes second"),
    ):
        result = integrate(goes_first)
        print(label)
        show("  First Hood secured by candidate's first turn", result["first"])
        show("  Reserve already secured before opponent's first response", result["early"])
        show("  First Hood + reserve accessible by candidate's second turn", result["reserve"])
        show("  Reserve by second turn, conditional on first Hood secured", result["conditional"])
        print(f"  Mulligan-tail width: {float(result['tail']):.3e}")
        print()

    print("Prize-only comparison:")
    print(f"  Second Hood not Prized, conditional on first Hood not Prized: {percent(Fraction(53, 59))}")
    print(f"  Both Hoods Prized in six Prizes: {percent(Fraction(1, 118))}")
    print("These Prize-only figures do not imply that Arven / VS Seeker is in hand in time.")


if __name__ == "__main__":
    main()
