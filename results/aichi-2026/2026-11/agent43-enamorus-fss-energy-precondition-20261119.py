#!/usr/bin/env python3
"""Exact first-two-turn V / Psychic Energy availability for the Enamorus variant.

Uses only the Python standard library. The model conditions on a valid opening
seven, deals six Prizes before natural draws, and separates first/second seat.
It does not model the Enamorus/Hood anchor, Guardian activation, or a game.
"""
from math import comb

# Shadow Rider V, Shadow Rider VMAX, Psychic Energy, other Basics (including
# Enamorus), and all other cards. Total = 60; there are 15 Basics.
COUNTS = (4, 4, 11, 11, 30)


def compositions(total, capacities, index=0, prefix=()):
    if index == len(capacities) - 1:
        if 0 <= total <= capacities[index]:
            yield prefix + (total,)
        return
    for quantity in range(min(total, capacities[index]) + 1):
        yield from compositions(
            total - quantity, capacities, index + 1, prefix + (quantity,)
        )


def exact_rates(going_second):
    valid_opening_weight = 0
    v_and_energy_by_turn_one = 0
    v_and_energy_by_turn_one_and_vmax_by_turn_two = 0

    for hand in compositions(7, COUNTS):
        # A valid opening has a Shadow Rider V or another Basic (Enamorus
        # is included in the other-Basic category).
        if hand[0] + hand[3] == 0:
            continue

        hand_weight = 1
        for count, quantity in zip(COUNTS, hand):
            hand_weight *= comb(count, quantity)
        valid_opening_weight += hand_weight

        after_hand = tuple(
            count - quantity for count, quantity in zip(COUNTS, hand)
        )

        for prizes in compositions(6, after_hand):
            prize_weight = 1
            for count, quantity in zip(after_hand, prizes):
                prize_weight *= comb(count, quantity)
            if prize_weight == 0:
                continue

            after_prizes = tuple(
                count - quantity for count, quantity in zip(after_hand, prizes)
            )

            if going_second:
                # First and second own-turn draws are ordered.
                for first_category, first_available in enumerate(after_prizes):
                    if first_available == 0:
                        continue
                    for second_category, second_count in enumerate(after_prizes):
                        second_available = second_count - (
                            first_category == second_category
                        )
                        if second_available <= 0:
                            continue

                        v_by_turn_one = hand[0] + (first_category == 0) > 0
                        energy_by_turn_one = hand[2] + (first_category == 2) > 0
                        vmax_by_turn_two = (
                            hand[1]
                            + (first_category == 1)
                            + (second_category == 1)
                            > 0
                        )
                        ways = (
                            hand_weight
                            * prize_weight
                            * first_available
                            * second_available
                        )

                        if v_by_turn_one and energy_by_turn_one:
                            v_and_energy_by_turn_one += ways
                            if vmax_by_turn_two:
                                v_and_energy_by_turn_one_and_vmax_by_turn_two += ways
            else:
                # No draw on own turn one; one draw on own turn two.
                v_by_turn_one = hand[0] > 0
                energy_by_turn_one = hand[2] > 0
                if v_by_turn_one and energy_by_turn_one:
                    v_and_energy_by_turn_one += (
                        hand_weight * prize_weight * 47
                    )
                    for draw_category, available in enumerate(after_prizes):
                        if available == 0:
                            continue
                        vmax_by_turn_two = hand[1] + (draw_category == 1) > 0
                        if vmax_by_turn_two:
                            v_and_energy_by_turn_one_and_vmax_by_turn_two += (
                                hand_weight * prize_weight * available
                            )

    draw_denominator = 47 * 46 if going_second else 47
    denominator = (
        valid_opening_weight * comb(53, 6) * draw_denominator
    )

    return {
        "valid_opening_probability": (
            valid_opening_weight / comb(60, 7)
        ),
        "v_and_energy_by_turn_one": (
            v_and_energy_by_turn_one / denominator
        ),
        "v_and_energy_by_turn_one_and_vmax_by_turn_two": (
            v_and_energy_by_turn_one_and_vmax_by_turn_two / denominator
        ),
        "joint_numerator": v_and_energy_by_turn_one_and_vmax_by_turn_two,
        "denominator": denominator,
    }


if __name__ == "__main__":
    for seat, going_second in (("going_first", False), ("going_second", True)):
        result = exact_rates(going_second)
        print(seat)
        for key, value in result.items():
            print(f"{key}={value}")
