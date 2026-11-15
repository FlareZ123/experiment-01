#!/usr/bin/env python3
"""Exact Prize-capacity analysis for Hood Shield Shadow Rider's Regidrago counter-ALS.

This is a prize-configuration calculation, not a game or win-rate simulation.
It uses only the Python standard library.
"""

from math import comb

DECK_SIZE = 60
OPENING = 7
PRIZES = 6


def prize_failure_ways_after_hand(
    total_mimikyu: int,
    total_dialga: int,
    total_heavy_ball: int,
    hand_mimikyu: int,
    hand_dialga: int,
    hand_heavy_ball: int,
    remaining_deck: int,
) -> int:
    """Count Prize subsets that exceed available Heavy Ball recovery capacity."""
    remaining_mimikyu = total_mimikyu - hand_mimikyu
    remaining_dialga = total_dialga - hand_dialga
    remaining_heavy_ball = total_heavy_ball - hand_heavy_ball
    critical = (
        ["M"] * remaining_mimikyu
        + ["D"] * remaining_dialga
        + ["H"] * remaining_heavy_ball
    )
    other_remaining = remaining_deck - len(critical)
    failures = 0

    for mask in range(1 << len(critical)):
        prized = [critical[i] for i in range(len(critical)) if mask & (1 << i)]
        if len(prized) > PRIZES:
            continue

        prized_mimikyu = prized.count("M")
        prized_dialga = prized.count("D")
        prized_heavy_ball = prized.count("H")
        mimikyu_missing = (
            hand_mimikyu == 0
            and remaining_mimikyu > 0
            and prized_mimikyu == remaining_mimikyu
        )
        dialga_missing = (
            hand_dialga == 0
            and remaining_dialga > 0
            and prized_dialga == remaining_dialga
        )

        # Copies in hand or in the remaining deck are available; only Prized
        # Heavy Balls are unavailable. Deck copies are optimistically assumed
        # accessible later, for example through Arven or a natural draw.
        available_heavy_ball = total_heavy_ball - prized_heavy_ball
        missing_basics = int(mimikyu_missing) + int(dialga_missing)
        if missing_basics > available_heavy_ball:
            failures += comb(other_remaining, PRIZES - len(prized))

    return failures


def conditional_prize_failure(
    mimikyu_copies: int,
    dialga_copies: int,
    heavy_ball_copies: int,
    total_basics: int,
) -> tuple[int, int]:
    """Return (failure_pairs, all_legal_hand_prize_pairs).

    The opening hand is a uniform seven-card subset conditioned on >=1 Basic.
    The six Prizes are then a uniform subset of the remaining 53 cards.
    """
    other_basics = total_basics - mimikyu_copies - dialga_copies
    other_nonbasics = DECK_SIZE - total_basics - heavy_ball_copies
    assert other_basics >= 0 and other_nonbasics >= 0

    legal_hands = comb(DECK_SIZE, OPENING) - comb(
        DECK_SIZE - total_basics, OPENING
    )
    denominator = legal_hands * comb(DECK_SIZE - OPENING, PRIZES)
    failures = 0

    for hand_m in range(mimikyu_copies + 1):
        for hand_d in range(dialga_copies + 1):
            for hand_h in range(heavy_ball_copies + 1):
                for hand_other_basics in range(other_basics + 1):
                    for hand_other_nonbasics in range(other_nonbasics + 1):
                        if (
                            hand_m + hand_d + hand_h
                            + hand_other_basics + hand_other_nonbasics
                            != OPENING
                        ):
                            continue
                        if hand_m + hand_d + hand_other_basics == 0:
                            continue

                        hand_ways = (
                            comb(mimikyu_copies, hand_m)
                            * comb(dialga_copies, hand_d)
                            * comb(heavy_ball_copies, hand_h)
                            * comb(other_basics, hand_other_basics)
                            * comb(other_nonbasics, hand_other_nonbasics)
                        )
                        prize_failures = prize_failure_ways_after_hand(
                            mimikyu_copies,
                            dialga_copies,
                            heavy_ball_copies,
                            hand_m,
                            hand_d,
                            hand_h,
                            DECK_SIZE - OPENING,
                        )
                        failures += hand_ways * prize_failures

    assert denominator == legal_hands * comb(53, 6)
    return failures, denominator


def main() -> None:
    variants = [
        ("Hood Shield v1", 1, 1, 1, 14),
        ("v1 + second Heavy Ball", 1, 1, 2, 14),
        ("v1 + second Mimikyu (cut non-Basic)", 2, 1, 1, 15),
        ("v1 + second Dialga (cut non-Basic)", 1, 2, 1, 15),
    ]
    results = {}
    for label, mimikyu, dialga, heavy_ball, basics in variants:
        numerator, denominator = conditional_prize_failure(
            mimikyu, dialga, heavy_ball, basics
        )
        rate = numerator / denominator
        results[label] = rate
        print(
            f"{label}: {numerator}/{denominator} = "
            f"{100 * rate:.6f}%"
        )

    baseline = results["Hood Shield v1"]
    second_heavy_ball = results["v1 + second Heavy Ball"]
    print(
        "Second Heavy Ball relative reduction: "
        f"{100 * (1 - second_heavy_ball / baseline):.4f}%"
    )
    assert results["Hood Shield v1"] == 0.02366909103369581
    assert results["v1 + second Heavy Ball"] == 0.00219491873859848
    assert second_heavy_ball < results[
        "v1 + second Mimikyu (cut non-Basic)"
    ]
    assert second_heavy_ball < results[
        "v1 + second Dialga (cut non-Basic)"
    ]


if __name__ == "__main__":
    main()
