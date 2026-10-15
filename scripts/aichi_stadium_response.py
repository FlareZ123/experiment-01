"""Exact Iron Thorns Stadium access after one opening draw.

One uniformly shuffled 60-card source deck is dealt a seven-card opening hand,
then six Prize cards, then its turn draw. We condition on the opening hand
having at least one Basic Iron Thorns ex. Direct Stadium play is available to
both seats. The Guzma & Hala and Tag Call -> Guzma & Hala branches assume the
player may use one Supporter and unrestricted Items (e.g. going second).
No other draws, searches, opponent effects or mulligan bonus draws are modeled.
"""
from __future__ import annotations

import json
from itertools import product
from math import comb
from pathlib import Path

STADIUM_NAMES = {
    "Tropical Beach",
    "Player's Ceremony",
    "Thunder Mountain ♢",
    "Wondrous Labyrinth ♢",
}
RANKS = (6, 24, 29)


def allocations(total: int, capacities: tuple[int, ...]):
    """Yield count vectors with a specified total and component caps."""
    for prefix in product(*(range(min(total, cap) + 1) for cap in capacities[:-1])):
        remainder = total - sum(prefix)
        if 0 <= remainder <= capacities[-1]:
            yield (*prefix, remainder)


def access_probabilities(stadiums: int, basics: int = 4,
                         supporters: int = 2, items: int = 2) -> dict[str, float]:
    """Enumerate hand, prize, turn draw; return conditional access channels.

    Categories are Basic, Stadium, Guzma & Hala, Tag Call, and other.
    Assumes no card belongs to two categories and all cards are equally likely.
    """
    counts = (basics, stadiums, supporters, items,
              60 - basics - stadiums - supporters - items)
    if min(counts) < 0:
        raise ValueError("Invalid card group sizes")
    valid = 1 - comb(60 - basics, 7) / comb(60, 7)
    probability = [0.0, 0.0, 0.0, 0.0]

    for hand in allocations(7, counts):
        if hand[0] == 0:
            continue
        hand_prob = 1.0
        for number, drawn in zip(counts, hand):
            hand_prob *= comb(number, drawn)
        hand_prob /= comb(60, 7)
        if hand[1]:
            probability[0] += hand_prob

        remainder = tuple(c - h for c, h in zip(counts, hand))
        for prizes in allocations(6, remainder):
            prize_prob = 1.0
            for number, prized in zip(remainder, prizes):
                prize_prob *= comb(number, prized)
            prize_prob /= comb(53, 6)
            deck = tuple(c - p for c, p in zip(remainder, prizes))
            for category, available in enumerate(deck):
                if not available:
                    continue
                weight = hand_prob * prize_prob * available / 47
                next_hand = tuple(h + (i == category) for i, h in enumerate(hand))
                next_deck = tuple(c - (i == category) for i, c in enumerate(deck))
                if next_hand[1]:
                    probability[1] += weight
                elif next_deck[1] and next_hand[2]:
                    probability[2] += weight
                elif next_deck[1] and next_hand[3] and next_deck[2]:
                    probability[3] += weight

    direct_start, direct_turn, supporter, tag_call = probability
    return {
        "stadium_in_valid_starting_hand": direct_start / valid,
        "stadium_in_hand_after_turn_draw": direct_turn / valid,
        "guzma_hala_route_after_draw": supporter / valid,
        "tag_call_route_after_draw": tag_call / valid,
        "stadium_access_if_supporter_allowed": (
            direct_turn + supporter + tag_call) / valid,
        "no_modelled_stadium_access": (
            valid - direct_turn - supporter - tag_call) / valid,
    }


def report_published_field(manifest: dict) -> dict:
    """Audit only the three exact sourced Iron Thorns lists, with source checks."""
    out = []
    by_rank = {deck["rank"]: deck for deck in manifest["decks"]}
    for rank in RANKS:
        deck = by_rank[rank]
        cards = {row["name"]: row["count"] for row in deck["cards"]}
        if deck["archetype"] != "Iron Thorns" or cards.get("Iron Thorns ex") != 4:
            raise ValueError("Unexpected Iron Thorns source at rank " + str(rank))
        if cards.get("Guzma & Hala") != 2 or cards.get("Tag Call") != 2:
            raise ValueError("Access connector count changed at rank " + str(rank))
        stadiums = sum(cards.get(name, 0) for name in STADIUM_NAMES)
        if stadiums != {6: 4, 24: 4, 29: 5}[rank]:
            raise ValueError("Stadium printing audit changed at rank " + str(rank))
        out.append({"rank": rank, "stadium_copies": stadiums,
                    **access_probabilities(stadiums)})
    return {"scope": "Restricted direct Stadium / Guzma & Hala / Tag Call routes",
            "opponent_decks": out}


if __name__ == "__main__":
    path = Path(__file__).resolve().parents[1] / "results/aichi-2026/full-decklists.json"
    print(json.dumps(report_published_field(json.loads(path.read_text("utf-8"))), indent=2))
