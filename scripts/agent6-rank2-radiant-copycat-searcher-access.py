#!/usr/bin/env python3
"""Searcher-aware first-turn access model for the Hood Shadow Rider / Mimikyu line.

This is a resource-access model, not a game simulator or matchup win-rate model.
It assumes the candidate goes first and Mimikyu starts Active. The opponent's
first-turn use of TM: Evolution is conditional, not simulated.
"""
from __future__ import annotations

import argparse
import json
import math
import random
from collections import Counter
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANDIDATE = ROOT / "results/aichi-2026/candidate-hood-shadow-rider.json"
SEED_DEFAULT = 20261115
DEALS_DEFAULT = 2_000_000

CARD_TO_CATEGORY = {
    "Mimikyu": "Mimikyu",
    "Radiant Eternatus": "Radiant",
    "Shadow Rider Calyrex V": "V",
    "Shadow Rider Calyrex VMAX": "VMAX",
    "Psychic Energy": "Psychic",
    "Mysterious Treasure": "Treasure",
    "Fog Crystal": "Fog",
    "Quick Ball": "Quick",
    "Forest Seal Stone": "Stone",
    "Hisuian Heavy Ball": "Heavy",
    "Battle Compressor": "Compressor",
    "Night Stretcher": "Stretcher",
    "Dimension Valley": "Dimension",
}
CATEGORIES = (
    "Mimikyu", "Radiant", "V", "VMAX", "Psychic", "Treasure", "Fog",
    "Quick", "Stone", "Heavy", "Compressor", "Stretcher", "Dimension", "Other",
)
EXPECTED_COUNTS = {
    "Mimikyu": 1, "Radiant": 1, "V": 4, "VMAX": 4, "Psychic": 11,
    "Treasure": 4, "Fog": 4, "Quick": 1, "Stone": 1, "Heavy": 1,
    "Compressor": 1, "Stretcher": 1, "Dimension": 1, "Other": 25,
}


def load_deck() -> list[str]:
    data = json.loads(CANDIDATE.read_text(encoding="utf-8"))
    counts = Counter()
    for card in data["cards"]:
        category = CARD_TO_CATEGORY.get(card["name"], "Other")
        counts[category] += int(card["count"])
    observed = {category: counts[category] for category in CATEGORIES}
    if observed != EXPECTED_COUNTS:
        raise ValueError(f"Candidate list changed; expected {EXPECTED_COUNTS}, got {observed}")
    deck = [category for category in CATEGORIES for _ in range(counts[category])]
    if len(deck) != 60:
        raise ValueError(f"Expected 60 cards, got {len(deck)}")
    return deck


@lru_cache(maxsize=None)
def can_finish(state: tuple[int, ...], v_target: int, energy_target: int) -> bool:
    """Explore every searcher sequence in the simplified first-turn action model.

    State:
      hand R,V,E; deck R,V,E; prize R,V;
      hand Treasure,Fog,Quick,Stone,Heavy,Compressor,Stretcher; discardable Other.
    """
    (rh, vh, eh, rd, vd, ed, rp, vp,
     mt, fog, qb, stone, heavy, bc, ns, other) = state

    if rh >= 1 and vh >= v_target and eh >= energy_target:
        return True

    nxt = []

    # Hisuian Heavy Ball: recover a Basic Pokémon (Radiant or Shadow Rider V) from Prizes.
    if heavy:
        if rp and rh < 1:
            nxt.append((rh+1, vh, eh, rd, vd, ed, rp-1, vp,
                        mt, fog, qb, stone, heavy-1, bc, ns, other))
        if vp and vh < v_target:
            nxt.append((rh, vh+1, eh, rd, vd, ed, rp, vp-1,
                        mt, fog, qb, stone, heavy-1, bc, ns, other))

    # Fog Crystal: Basic Psychic Pokémon or Basic Psychic Energy.
    if fog:
        if vd and vh < v_target:
            nxt.append((rh, vh+1, eh, rd, vd-1, ed, rp, vp,
                        mt, fog-1, qb, stone, heavy, bc, ns, other))
        if ed and eh < energy_target:
            nxt.append((rh, vh, eh+1, rd, vd, ed-1, rp, vp,
                        mt, fog-1, qb, stone, heavy, bc, ns, other))

    # Mysterious Treasure: Psychic or Dragon Pokémon; discard one non-core card.
    if mt and other:
        if rd and rh < 1:
            nxt.append((rh+1, vh, eh, rd-1, vd, ed, rp, vp,
                        mt-1, fog, qb, stone, heavy, bc, ns, other-1))
        if vd and vh < v_target:
            nxt.append((rh, vh+1, eh, rd, vd-1, ed, rp, vp,
                        mt-1, fog, qb, stone, heavy, bc, ns, other-1))

    # Quick Ball: Basic Pokémon; discard one non-core card.
    if qb and other:
        if rd and rh < 1:
            nxt.append((rh+1, vh, eh, rd-1, vd, ed, rp, vp,
                        mt, fog, qb-1, stone, heavy, bc, ns, other-1))
        if vd and vh < v_target:
            nxt.append((rh, vh+1, eh, rd, vd-1, ed, rp, vp,
                        mt, fog, qb-1, stone, heavy, bc, ns, other-1))

    # Forest Seal Stone: one universal search, after a Pokémon V is in play.
    if stone and vh >= 1:
        if rd and rh < 1:
            nxt.append((rh+1, vh, eh, rd-1, vd, ed, rp, vp,
                        mt, fog, qb, stone-1, heavy, bc, ns, other))
        if vd and vh < v_target:
            nxt.append((rh, vh+1, eh, rd, vd-1, ed, rp, vp,
                        mt, fog, qb, stone-1, heavy, bc, ns, other))
        if ed and eh < energy_target:
            nxt.append((rh, vh, eh+1, rd, vd, ed-1, rp, vp,
                        mt, fog, qb, stone-1, heavy, bc, ns, other))

    # Battle Compressor + Night Stretcher: move one Pokémon/Basic Energy from deck to hand.
    if bc and ns:
        if rd and rh < 1:
            nxt.append((rh+1, vh, eh, rd-1, vd, ed, rp, vp,
                        mt, fog, qb, stone, heavy, bc-1, ns-1, other))
        if vd and vh < v_target:
            nxt.append((rh, vh+1, eh, rd, vd-1, ed, rp, vp,
                        mt, fog, qb, stone, heavy, bc-1, ns-1, other))
        if ed and eh < energy_target:
            nxt.append((rh, vh, eh+1, rd, vd, ed-1, rp, vp,
                        mt, fog, qb, stone, heavy, bc-1, ns-1, other))

    return any(can_finish(s, v_target, energy_target) for s in nxt)


def access_state(hand: list[str], opening: list[str], prizes: list[str],
                 deck: list[str], v_target: int, energy_target: int) -> tuple[bool, dict]:
    # Mimikyu must be in the opening seven and can be chosen Active.
    if "Mimikyu" not in opening:
        return False, {}
    vmax_deck = deck.count("VMAX")
    vmax_prized = prizes.count("VMAX")
    if vmax_deck < 2:
        return False, {"vmax_deck": vmax_deck, "vmax_prized": vmax_prized}

    state = (
        hand.count("Radiant"), hand.count("V"), hand.count("Psychic"),
        deck.count("Radiant"), deck.count("V"), deck.count("Psychic"),
        prizes.count("Radiant"), prizes.count("V"),
        hand.count("Treasure"), hand.count("Fog"), hand.count("Quick"),
        hand.count("Stone"), hand.count("Heavy"), hand.count("Compressor"),
        hand.count("Stretcher"), hand.count("Other"),
    )
    success = can_finish(state, v_target, energy_target)
    return success, {"vmax_deck": vmax_deck, "vmax_prized": vmax_prized}


def wilson(k: int, n: int, z: float = 1.959963984540054) -> tuple[float, float, float]:
    p = k / n
    den = 1 + z*z/n
    center = (p + z*z/(2*n)) / den
    half = z * math.sqrt((p*(1-p)/n) + (z*z/(4*n*n))) / den
    return p, center-half, center+half


def result_row(k: int, n: int, conditional_n: int) -> dict:
    return {
        "count": k,
        "unconditional": wilson(k, n),
        "conditional_on_mimikyu_open": wilson(k, conditional_n),
    }


def run(deals: int, seed: int) -> dict:
    base = load_deck()
    rng = random.Random(seed)
    counts = Counter()
    for _ in range(deals):
        cards = base.copy()
        rng.shuffle(cards)
        opening = cards[:7]
        prizes = cards[7:13]
        first_draw = cards[13]
        hand = opening + [first_draw]
        deck = cards[14:]

        if "Mimikyu" not in opening:
            continue
        counts["mimikyu_open"] += 1

        # One Psychic Energy by end of turn 1: first-turn attach is available.
        ok, meta = access_state(hand, opening, prizes, deck, v_target=1, energy_target=1)
        if ok and meta["vmax_prized"] <= 1:
            counts["e1_3plus"] += 1

        # Two V in play, no VMAX Prized: Radiant can create a four-VMAX board.
        ok, meta = access_state(hand, opening, prizes, deck, v_target=2, energy_target=1)
        if ok and meta["vmax_prized"] == 0:
            counts["e1_4"] += 1

        # Strict energy sufficiency: two Psychic Energy accessible by end of turn 1.
        ok, meta = access_state(hand, opening, prizes, deck, v_target=1, energy_target=2)
        if ok and meta["vmax_prized"] <= 1:
            counts["e2_3plus"] += 1

        ok, meta = access_state(hand, opening, prizes, deck, v_target=2, energy_target=2)
        if ok and meta["vmax_prized"] == 0:
            counts["e2_4"] += 1

        # Direct-draw-only reference event, matching Agent41's screen; no searchers.
        second_draw = cards[14]
        first8 = opening + [first_draw]
        first9 = first8 + [second_draw]
        vmax_prized = prizes.count("VMAX")
        vmax_deck = deck.count("VMAX")
        direct_common = (
            "Radiant" in first8
            and first8.count("V") >= 1
            and first8.count("Psychic") >= 1
            and first9.count("Psychic") >= 2
            and vmax_deck >= 2
        )
        if direct_common and vmax_prized <= 1:
            counts["direct_draw_3plus"] += 1
        if (direct_common and first8.count("V") >= 2 and vmax_prized == 0):
            counts["direct_draw_4"] += 1

    n_mimikyu = counts["mimikyu_open"]
    keys = ("e1_3plus", "e1_4", "e2_3plus", "e2_4",
            "direct_draw_3plus", "direct_draw_4")
    return {
        "candidate": str(CANDIDATE.relative_to(ROOT)),
        "seed": seed,
        "deals": deals,
        "mimikyu_open_count": n_mimikyu,
        "mimikyu_open_rate": wilson(n_mimikyu, deals),
        "results": {key: result_row(counts[key], deals, n_mimikyu) for key in keys},
        "search_model": {
            "searchers": ["Mysterious Treasure", "Fog Crystal", "Quick Ball",
                          "Forest Seal Stone", "Hisuian Heavy Ball",
                          "Battle Compressor + Night Stretcher"],
            "first_turn_supporters": "not used (candidate is first player)",
            "discard_assumption": "each Treasure/Quick Ball can discard one Other card; Other is assumed expendable",
            "first_turn_energy": "E1 = one Psychic Energy accessible; E2 = two accessible by end of first turn",
            "vmax_requirement": "at least two VMAX remain in deck for Radiant Eternatus",
            "opponent_action": "conditional on opponent using non-GX TM: Evolution on its first turn",
        },
        "cache": can_finish.cache_info()._asdict(),
    }


def self_test() -> None:
    # Targets already in hand.
    direct = (1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    assert can_finish(direct, 2, 1)
    # Fog Crystal can find a V and Psychic Energy; Treasure can find Radiant.
    fog_treasure = (0, 1, 0, 1, 1, 1, 0, 0, 1, 2, 0, 0, 0, 0, 0, 1)
    assert can_finish(fog_treasure, 2, 1)
    # Stone cannot be the first way to find a V: it requires a V in play.
    stone_only = (0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1)
    assert not can_finish(stone_only, 1, 1)
    # Heavy Ball can retrieve Radiant from Prizes; Fog finds V and Energy.
    heavy_fog = (0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1)
    assert can_finish(heavy_fog, 2, 1)
    # Treasure needs a discardable Other card.
    no_discard = (0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0)
    assert not can_finish(no_discard, 1, 1)
    # Battle Compressor + Night Stretcher can retrieve one Basic Energy.
    bc_ns = (1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0)
    assert can_finish(bc_ns, 2, 1)
    print("self-test: ok")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--deals", type=int, default=DEALS_DEFAULT)
    parser.add_argument("--seed", type=int, default=SEED_DEFAULT)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    print(json.dumps(run(args.deals, args.seed), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
