#!/usr/bin/env python3
"""Paired-mulligan-adjusted natural-draw exposure to two-Hood removal.

This is a source-bound resource-access calculation, not a game simulator.
It measures whether a Field Blower or Megaton Blower is seen in the opponent's
opening hand, optional paired-mulligan bonus cards, or normal draws by the
first response window. It does not model search, card expenditure, board state,
actual play, or matchup outcomes.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import defaultdict
from fractions import Fraction
from math import comb
from pathlib import Path

CANDIDATE_BASICS_EXPECTED = 14
K_MAX = 10


def normalize_name(name: str) -> str:
    # Limitless uses ♢ in a few names; the card database uses ◇.
    return name.replace("♢", "◇").replace("♦", "◇").strip()


def git_blob_sha(path: Path) -> str:
    data = path.read_bytes()
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def read_card_subtype_flags(card_dir: Path) -> dict[str, set[bool]]:
    flags: dict[str, set[bool]] = defaultdict(set)
    files = sorted(card_dir.glob("*.json"))
    if not files:
        raise FileNotFoundError(f"No card database JSON files in {card_dir}")
    for path in files:
        cards = json.loads(path.read_text(encoding="utf-8"))
        for card in cards:
            if card.get("supertype") != "Pokémon":
                continue
            flags[normalize_name(card["name"])].add(
                "Basic" in card.get("subtypes", [])
            )
    return flags


def is_basic(name: str, flags: dict[str, set[bool]]) -> bool:
    key = normalize_name(name)
    values = flags.get(key)
    if not values:
        raise ValueError(f"Source Pokémon not found in card pool: {name!r}")
    if len(values) != 1:
        raise ValueError(
            f"Ambiguous Basic/non-Basic classification for {name!r}: {sorted(values)}"
        )
    return next(iter(values))


def deck_inventory(deck: dict, flags: dict[str, set[bool]]) -> dict:
    cards = deck["cards"]
    total = sum(card["count"] for card in cards)
    if total != 60:
        raise ValueError(f"Rank {deck.get('rank')} has {total} cards, not 60")

    basics = sum(
        card["count"]
        for card in cards
        if card["category"] == "Pokémon" and is_basic(card["name"], flags)
    )
    field_blower = sum(
        card["count"] for card in cards if card["name"] == "Field Blower"
    )
    megaton_blower = sum(
        card["count"] for card in cards if card["name"] == "Megaton Blower"
    )
    return {
        "rank": deck["rank"],
        "player": deck.get("player"),
        "archetype": deck.get("archetype"),
        "basics": basics,
        "field_blower": field_blower,
        "megaton_blower": megaton_blower,
        "removers": field_blower + megaton_blower,
    }


def paired_bonus_distribution(opponent_basics: int, k_max: int = K_MAX):
    """P(M=m), where M is opponent bonus cards from candidate mulligans.

    Both players restart if both opening sevens lack a Basic. The optional
    bonus is drawn only after the six Prizes have been set.
    """
    q_candidate = Fraction(
        comb(60 - CANDIDATE_BASICS_EXPECTED, 7), comb(60, 7)
    )
    q_opponent = Fraction(
        comb(60 - opponent_basics, 7), comb(60, 7)
    )
    p_candidate = 1 - q_candidate
    p_opponent = 1 - q_opponent
    denominator = 1 - q_candidate * q_opponent

    probabilities = [1 - p_opponent * q_candidate / denominator]
    probabilities.extend(
        p_opponent * p_candidate * q_candidate**m / denominator
        for m in range(1, k_max + 1)
    )
    residual = p_opponent * q_candidate ** (k_max + 1) / denominator
    assert sum(probabilities) + residual == 1
    return probabilities, residual


def natural_draw_access(
    opponent_basics: int, remover_copies: int, draw_count: int
) -> Fraction:
    """P(at least one remover seen | valid opening seven), exactly.

    The opening hand must contain >=1 Basic and 0 removers for the no-access
    complement. Six Prizes are then sampled from the remaining 53 cards, and
    draw_count cards are sampled from the 47 cards left after Prizes.
    """
    if not 0 <= opponent_basics <= 60 or not 0 <= remover_copies <= 60:
        raise ValueError("Invalid deck counts")
    if opponent_basics == 0:
        raise ValueError("A valid opening requires at least one Basic in the deck")
    if remover_copies == 0:
        return Fraction(0)
    other = 60 - opponent_basics - remover_copies
    if other < 0:
        raise ValueError("Basic and remover counts exceed 60")
    if not 0 <= draw_count <= 47:
        raise ValueError("Invalid draw count")

    valid_openings = comb(60, 7) - comb(60 - opponent_basics, 7)
    # Valid opening compositions containing no Field/Megaton Blower.
    no_remover_valid_openings = sum(
        comb(opponent_basics, basics_in_opening)
        * comb(other, 7 - basics_in_opening)
        for basics_in_opening in range(1, min(7, opponent_basics) + 1)
        if 0 <= 7 - basics_in_opening <= other
    )
    p_no_remover_opening = Fraction(
        no_remover_valid_openings, valid_openings
    )

    # Conditional on no remover in the opening, R removers remain among 53.
    # If r are Prized, R-r remain among the 47-card draw pile.
    p_no_remover_draws = Fraction(0)
    for prized_removers in range(0, min(remover_copies, 6) + 1):
        nonremover_prizes = 6 - prized_removers
        if not 0 <= nonremover_prizes <= 53 - remover_copies:
            continue
        prize_weight = comb(remover_copies, prized_removers) * comb(
            53 - remover_copies, nonremover_prizes
        )
        no_remover_draw_weight = comb(
            47 - (remover_copies - prized_removers), draw_count
        )
        p_no_remover_draws += Fraction(
            prize_weight * no_remover_draw_weight,
            comb(53, 6) * comb(47, draw_count),
        )

    return 1 - p_no_remover_opening * p_no_remover_draws


def paired_access_interval(
    opponent_basics: int,
    remover_copies: int,
    normal_draws: int,
    k_max: int = K_MAX,
):
    probabilities, residual = paired_bonus_distribution(opponent_basics, k_max)
    truncated = sum(
        probability
        * natural_draw_access(opponent_basics, remover_copies, bonus + normal_draws)
        for bonus, probability in enumerate(probabilities)
    )
    # Access is monotone in draw count. Bound the omitted geometric tail using
    # access at K_MAX+1 as its lower endpoint and 1 as its upper endpoint.
    tail_minimum = natural_draw_access(
        opponent_basics, remover_copies, k_max + 1 + normal_draws
    )
    if remover_copies == 0:
        lower = upper = Fraction(0)
    else:
        lower = truncated + residual * tail_minimum
        upper = truncated + residual
    return {
        "lower": lower,
        "upper": upper,
        "tail_mass": residual,
        "bonus_probability": 1 - probabilities[0],
    }


def percent(value: Fraction, digits: int = 8) -> str:
    return f"{float(value) * 100:.{digits}f}%"


def self_test() -> None:
    # Cross-check the exact paired setup and natural-draw calculation against
    # the existing rank-7 all-remover calculation (Faba x2 + FB + MB = 4).
    one = paired_access_interval(12, 4, 1)
    two = paired_access_interval(12, 4, 2)
    assert abs(float(one["lower"]) * 100 - 43.3224113545) < 1e-6
    assert abs(float(two["lower"]) * 100 - 47.6926849438) < 1e-6
    no_remover = paired_access_interval(12, 0, 1)
    assert no_remover["lower"] == no_remover["upper"] == 0
    assert natural_draw_access(12, 2, 2) >= natural_draw_access(12, 2, 1)
    print("self-test: PASS")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=None)
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return

    root = args.root or Path(__file__).resolve().parents[3]
    source_path = root / "results/aichi-2026/full-decklists.json"
    candidate_path = root / "results/aichi-2026/candidate-hood-shadow-rider.json"
    card_dir = root / "resources/cards/en"
    source = json.loads(source_path.read_text(encoding="utf-8"))
    candidate = json.loads(candidate_path.read_text(encoding="utf-8"))
    flags = read_card_subtype_flags(card_dir)

    candidate_inventory = deck_inventory(candidate, flags)
    if candidate_inventory["basics"] != CANDIDATE_BASICS_EXPECTED:
        raise ValueError(
            f"Candidate Basic count changed: {candidate_inventory['basics']}"
        )
    rows = []
    for deck in sorted(source["decks"], key=lambda d: d["rank"]):
        inventory = deck_inventory(deck, flags)
        first = paired_access_interval(
            inventory["basics"], inventory["removers"], normal_draws=1
        )
        second = paired_access_interval(
            inventory["basics"], inventory["removers"], normal_draws=2
        )
        rows.append({
            **inventory,
            "opponent_bonus_probability": first["bonus_probability"],
            "candidate_first": first,
            "candidate_second": second,
        })

    covered_ranks = {row["rank"] for row in rows} | {
        item["rank"] for item in source.get("missing_full_lists", [])
    }
    if covered_ranks != set(range(1, 33)):
        raise ValueError(f"Source rank coverage is not 1..32: {sorted(covered_ranks)}")
    if len(rows) != source.get("published_deck_count", len(rows)):
        raise ValueError("Published source-list count does not match deck rows")

    result = {
        "schema_version": 1,
        "benchmark": source.get("event"),
        "source_file": "results/aichi-2026/full-decklists.json",
        "source_blob_sha": git_blob_sha(source_path),
        "candidate_file": "results/aichi-2026/candidate-hood-shadow-rider.json",
        "candidate_blob_sha": git_blob_sha(candidate_path),
        "candidate_basics": candidate_inventory["basics"],
        "k_max": K_MAX,
        "exact_source_lists": len(rows),
        "missing_ranks": [x["rank"] for x in source.get("missing_full_lists", [])],
        "ranks": [
            {
                **{
                    k: v for k, v in row.items()
                    if k not in (
                        "candidate_first", "candidate_second",
                        "opponent_bonus_probability"
                    )
                },
                "opponent_bonus_probability": str(row["opponent_bonus_probability"]),
                "candidate_first": {
                    "lower": str(row["candidate_first"]["lower"]),
                    "upper": str(row["candidate_first"]["upper"]),
                    "tail_mass": str(row["candidate_first"]["tail_mass"]),
                    "bonus_probability": str(row["candidate_first"]["bonus_probability"]),
                },
                "candidate_second": {
                    "lower": str(row["candidate_second"]["lower"]),
                    "upper": str(row["candidate_second"]["upper"]),
                    "tail_mass": str(row["candidate_second"]["tail_mass"]),
                    "bonus_probability": str(row["candidate_second"]["bonus_probability"]),
                },
            }
            for row in rows
        ],
        "limitations": [
            "natural-draw exposure only; no search effects are modeled",
            "does not model whether a remover is spent before Hood appears",
            "does not model card retention, board state, locks, or successful play",
            "not a game, matchup, or win-rate estimate",
        ],
    }

    if args.json:
        print(json.dumps(result, indent=2))
        return

    print("Aichi field — paired-mulligan-adjusted Field/Megaton Blower exposure")
    print(f"source SHA: {result['source_blob_sha']}")
    print(
        f"candidate SHA: {result['candidate_blob_sha']} "
        f"({candidate_inventory['basics']} Basics)"
    )
    print("Probabilities are conditional on both players reaching valid opening sevens.")
    print("Event: at least one Field Blower or Megaton Blower seen by the response window.")
    print()
    print("Rank  Basics  FB  MB  Opp bonus>=1  Candidate first  Candidate second")
    for row in rows:
        first = row["candidate_first"]
        second = row["candidate_second"]
        print(
            f"{row['rank']:>4}  {row['basics']:>6}  {row['field_blower']:>2}  "
            f"{row['megaton_blower']:>2}  {percent(row['opponent_bonus_probability']):>13}  "
            f"{percent(first['lower'])}–{percent(first['upper'])}  "
            f"{percent(second['lower'])}–{percent(second['upper'])}"
        )
    print()
    print(f"Missing source ranks: {result['missing_ranks']}")
    print("A zero means no Field/Megaton Blower in that exact list, not no other tool pressure.")
    print(
        "Maximum omitted mulligan-tail mass:",
        max(float(row["candidate_first"]["tail_mass"]) for row in rows),
    )


if __name__ == "__main__":
    main()
