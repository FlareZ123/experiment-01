#!/usr/bin/env python3
"""Exact direct-draw access screen for the Hood Shadow Rider / Rank-2 line.

Run from the experiment-01 repository root:
    python agents/agent41/rank2_radiant_copycat_access.py

This enumerates only specified natural-draw subcases. It does NOT model search
Items, discard costs, Supporters, mulligan bonuses, switching, opponent turn
order/locks, Twinleaf execution, or match outcomes. The no-lock sequence assumes
the candidate is on the play. It is not a game-win estimate.
"""
from __future__ import annotations

import json
from math import comb
from pathlib import Path
from typing import Iterator

DECK_PATH = Path("results/aichi-2026/candidate-hood-shadow-rider.json")


def count_card(cards: list[dict], name: str, set_code: str, number: str) -> int:
    return sum(
        card["count"]
        for card in cards
        if card["name"] == name
        and card.get("printing", {}).get("set") == set_code
        and str(card.get("printing", {}).get("number")) == number
    )


def compositions(caps: list[int], total: int) -> Iterator[tuple[int, ...]]:
    values = [0] * len(caps)

    def visit(i: int, left: int) -> Iterator[tuple[int, ...]]:
        if i == len(caps) - 1:
            if 0 <= left <= caps[i]:
                values[i] = left
                yield tuple(values)
            return
        for n in range(min(caps[i], left) + 1):
            values[i] = n
            yield from visit(i + 1, left - n)

    yield from visit(0, total)


def load_counts() -> list[int]:
    deck = json.loads(DECK_PATH.read_text(encoding="utf-8"))
    cards = deck["cards"]
    total = sum(card["count"] for card in cards)
    assert total == 60, f"candidate must remain 60 cards, got {total}"

    mimikyu = count_card(cards, "Mimikyu", "GRI", "58")
    radiant = count_card(cards, "Radiant Eternatus", "CRZ", "105")
    shadow_v = count_card(cards, "Shadow Rider Calyrex V", "CRE", "74")
    shadow_vmax = count_card(cards, "Shadow Rider Calyrex VMAX", "CRE", "75")
    psychic = sum(card["count"] for card in cards if card["name"] == "Psychic Energy")
    counts = [mimikyu, radiant, shadow_v, shadow_vmax, psychic]
    assert counts == [1, 1, 4, 4, 11], f"unexpected candidate core counts: {counts}"
    return counts + [60 - sum(counts)]


def main() -> None:
    counts = load_counts()  # Mimikyu, Radiant, V, VMAX, Psychic, other
    denominator = comb(60, 7) * comb(53, 6) * 47 * 46
    mimikyu_start_denominator = denominator * 7 // 60

    event_names = (
        "radiant_3_vmax_board",
        "radiant_3_vmax_with_copycat_evolution",
        "radiant_4_vmax_board",
        "radiant_4_vmax_with_copycat_evolution",
        "radiant_4_vmax_with_two_copycat_evolutions",
    )
    events = {name: 0 for name in event_names}

    # Sequence: opening 7, six prizes, candidate's first-turn draw,
    # opponent's turn, candidate's second-turn draw.
    for opening in compositions(counts, 7):
        opening_weight = 1
        for available, chosen in zip(counts, opening):
            opening_weight *= comb(available, chosen)
        after_opening = [available - chosen for available, chosen in zip(counts, opening)]

        for prizes in compositions(after_opening, 6):
            prize_weight = 1
            for available, chosen in zip(after_opening, prizes):
                prize_weight *= comb(available, chosen)
            after_prizes = [available - chosen for available, chosen in zip(after_opening, prizes)]

            for first_draw_category, first_draw_available in enumerate(after_prizes):
                if not first_draw_available:
                    continue
                after_first_draw = after_prizes.copy()
                after_first_draw[first_draw_category] -= 1
                first8 = [opening[i] for i in range(6)]
                first8[first_draw_category] += 1

                # Second draw category is enumerated separately to preserve order.
                for second_draw_category, second_draw_count in enumerate(after_first_draw):
                    if not second_draw_count:
                        continue
                    weight = opening_weight * prize_weight * first_draw_available * second_draw_count
                    first9 = first8.copy()
                    first9[second_draw_category] += 1

                    # Mimikyu is the opening Active. Radiant and the first
                    # Psychic Energy are available before Climactic Gate ends turn 1.
                    if opening[0] != 1 or first8[1] < 1 or first8[4] < 1 or first9[4] < 2:
                        continue

                    vmax_in_first8 = first8[3]
                    vmax_prized = prizes[3]
                    vmax_still_in_deck = 4 - vmax_in_first8 - vmax_prized

                    # Three-VMAX branch: one V is in play before turn 1 ends;
                    # Radiant fetches two VMAX; one further VMAX is available
                    # in hand/deck to evolve that V on the response turn.
                    if first8[2] >= 1 and vmax_prized <= 1 and vmax_still_in_deck >= 2:
                        events["radiant_3_vmax_board"] += weight
                        if vmax_still_in_deck >= 3:
                            events["radiant_3_vmax_with_copycat_evolution"] += weight

                    # Four-VMAX branch: two V are in play before turn 1 ends;
                    # Radiant fetches two VMAX and the other two are available
                    # in hand/deck for normal or effect-based evolution.
                    if first8[2] >= 2 and vmax_prized == 0 and vmax_still_in_deck >= 2:
                        events["radiant_4_vmax_board"] += weight
                        if vmax_still_in_deck >= 3:
                            events["radiant_4_vmax_with_copycat_evolution"] += weight
                        if vmax_still_in_deck >= 4:
                            events["radiant_4_vmax_with_two_copycat_evolutions"] += weight

    p_mimikyu_start = 7 / 60
    print("candidate_core_counts=Mimikyu:1,RadiantEternatus:1,ShadowRiderV:4,ShadowRiderVMAX:4,PsychicEnergy:11")
    print(f"ordered_deal_denominator={denominator}")
    print(f"P(Mimikyu in opening 7)={p_mimikyu_start:.9%}")
    print("All probabilities below are strict direct-draw subcases, not actual pilot frequencies.")
    for name, numerator in events.items():
        p_all = numerator / denominator
        p_given_mimikyu = numerator / mimikyu_start_denominator
        print(
            f"{name}: numerator={numerator}; "
            f"P(all deals)={p_all:.9%}; "
            f"P(given Mimikyu start)={p_given_mimikyu:.9%}"
        )


if __name__ == "__main__":
    main()
