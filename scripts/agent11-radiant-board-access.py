#!/usr/bin/env python3
"""First-turn Radiant + two-VMAX access, reusing Agent6's searcher feasibility model.

This deliberately removes the Mimikyu-in-opening requirement from Agent6's
Copycat-specific event. It estimates setup/resource access, not game wins.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AGENT6_PATH = ROOT / "scripts/agent6-rank2-radiant-copycat-searcher-access.py"

BASIC_NAMES = {
    "Mimikyu",
    "Radiant Eternatus",
    "Shadow Rider Calyrex V",
    "Lillie's Clefairy ex",
    "Tapu Lele-GX",
    "Trevenant & Dusknoir-GX",
    "Latias ex",
    "Dialga-GX",
    "Girafarig",
    "Marshadow",
}


def load_agent6():
    spec = importlib.util.spec_from_file_location("agent6_searcher_access", AGENT6_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load Agent6 searcher model at {AGENT6_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def wilson(successes: int, trials: int, z: float = 1.959963984540054):
    if trials == 0:
        return [0.0, 0.0]
    p = successes / trials
    den = 1.0 + z * z / trials
    center = (p + z * z / (2.0 * trials)) / den
    half = z * ((p * (1.0 - p) / trials + z * z / (4.0 * trials * trials)) ** 0.5) / den
    return [center - half, center + half]


def load_deck(agent6):
    data = json.loads(agent6.CANDIDATE.read_text(encoding="utf-8"))
    cards = []
    category_counts = Counter()
    basic_count = 0
    for entry in data["cards"]:
        name = entry["name"]
        count = int(entry["count"])
        category = agent6.CARD_TO_CATEGORY.get(name, "Other")
        category_counts[category] += count
        if name in BASIC_NAMES:
            basic_count += count
        cards.extend([(name, category)] * count)

    expected = agent6.EXPECTED_COUNTS
    observed = {category: category_counts[category] for category in agent6.CATEGORIES}
    if observed != expected:
        raise ValueError(f"Candidate/category mismatch: expected {expected}, got {observed}")
    if len(cards) != 60 or basic_count != 14:
        raise ValueError(f"Expected 60 cards and 14 Basics; got {len(cards)} cards and {basic_count} Basics")
    return cards


def state_for(agent6, hand, prizes, deck):
    def count(cards, category):
        return sum(1 for _, c in cards if c == category)

    return (
        count(hand, "Radiant"), count(hand, "V"), count(hand, "Psychic"),
        count(deck, "Radiant"), count(deck, "V"), count(deck, "Psychic"),
        count(prizes, "Radiant"), count(prizes, "V"),
        count(hand, "Treasure"), count(hand, "Fog"), count(hand, "Quick"),
        count(hand, "Stone"), count(hand, "Heavy"), count(hand, "Compressor"),
        count(hand, "Stretcher"), count(hand, "Other"),
    )


def run(deals: int, seed: int):
    agent6 = load_agent6()
    cards = load_deck(agent6)
    rng = random.Random(seed)
    legal = board = board_plus_energy = vmax_two = 0

    for _ in range(deals):
        rng.shuffle(cards)
        opening = cards[:7]
        prizes = cards[7:13]
        hand = opening + [cards[13]]
        deck = cards[14:]

        is_legal = any(name in BASIC_NAMES for name, _ in opening)
        if is_legal:
            legal += 1
        if sum(1 for _, category in deck if category == "VMAX") < 2:
            continue
        vmax_two += 1

        state = state_for(agent6, hand, prizes, deck)
        # v_target=0 and energy_target=0: Radiant access plus two VMAX still
        # in deck; no Mimikyu or Copycat-energy requirement.
        has_board = agent6.can_finish(state, 0, 0)
        if has_board and is_legal:
            board += 1
            # energy_target=1 asks whether one Psychic Energy can also be
            # available in hand by the end of the same first-turn search line.
            if agent6.can_finish(state, 0, 1):
                board_plus_energy += 1

    if legal == 0:
        raise RuntimeError("No legal opening hands sampled")
    return {
        "candidate": str(agent6.CANDIDATE.relative_to(ROOT)),
        "deals": deals,
        "seed": seed,
        "legal_openings": legal,
        "legal_opening_rate": legal / deals,
        "vmax_two_in_deck_rate": vmax_two / deals,
        "radiant_plus_two_vmax": {
            "successes": board,
            "conditional_on_legal_seven": board / legal,
            "wilson_95": wilson(board, legal),
            "unconditional": board / deals,
            "unconditional_wilson_95": wilson(board, deals),
        },
        "radiant_plus_two_vmax_plus_one_psychic_energy": {
            "successes": board_plus_energy,
            "conditional_on_legal_seven": board_plus_energy / legal,
            "wilson_95": wilson(board_plus_energy, legal),
            "unconditional": board_plus_energy / deals,
            "unconditional_wilson_95": wilson(board_plus_energy, deals),
            "conditional_on_board": board_plus_energy / board if board else 0.0,
        },
        "searcher_model": "Agent6 can_finish(state, v_target=0, energy_target=0|1)",
        "searcher_cache": str(agent6.can_finish.cache_info()),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--deals", type=int, default=2_000_000)
    parser.add_argument("--seed", type=int, default=20261126)
    args = parser.parse_args()
    print(json.dumps(run(args.deals, args.seed), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
