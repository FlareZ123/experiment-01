#!/usr/bin/env python3
"""Exact full-32 bounds for the two-sided Aichi mulligan bonus-offer metric.

This is a setup-only mathematical bound. It does not reconstruct missing lists
or estimate accepted bonus draws, games, matchups, or win rates.
"""
from __future__ import annotations

from collections import Counter
from fractions import Fraction
from math import comb
import json

BASICS_BY_RANK = {
    1: 14, 2: 14, 3: 11, 4: 13, 5: 11, 6: 4, 7: 12, 8: 10, 9: 11,
    10: 15, 11: 11, 12: 15, 13: 11, 14: 14, 15: 14, 16: 11, 17: 13,
    18: 16, 19: 16, 20: 14, 21: 14, 22: 12, 24: 4, 26: 12, 27: 15,
    29: 4, 30: 16, 31: 15, 32: 13,
}
MISSING_RANKS = (23, 25, 28)
CANDIDATE_BASICS = (5, 14)


def choose(n: int, k: int) -> int:
    return comb(n, k) if 0 <= k <= n else 0


def valid_opening_probability(basics: int) -> Fraction:
    if not 1 <= basics <= 60:
        raise ValueError("a playable deck must have 1..60 Basic Pokémon")
    total = choose(60, 7)
    return Fraction(total - choose(60 - basics, 7), total)


def paired_bonus_stats(candidate_basics: int, opponent_basics: int) -> dict[str, Fraction]:
    p_a = valid_opening_probability(candidate_basics)
    p_b = valid_opening_probability(opponent_basics)
    q_a, q_b = 1 - p_a, 1 - p_b
    z = 1 - q_a * q_b
    opponent_opportunity = q_a * p_b / z
    candidate_opportunity = p_a * q_b / z
    neither = p_a * p_b / z
    opponent_max_offers = opponent_opportunity / p_a
    candidate_max_offers = candidate_opportunity / p_b
    return {
        "opponent_opportunity": opponent_opportunity,
        "candidate_opportunity": candidate_opportunity,
        "neither": neither,
        "opponent_max_offers": opponent_max_offers,
        "candidate_max_offers": candidate_max_offers,
        "difference": opponent_max_offers - candidate_max_offers,
    }


def build_report() -> dict:
    ranks = set(BASICS_BY_RANK)
    expected = set(range(1, 33)) - set(MISSING_RANKS)
    if ranks != expected or len(BASICS_BY_RANK) != 29:
        raise AssertionError("the known-source Basic-count vector is not exactly 29/32")
    if sum(BASICS_BY_RANK.values()) != 355:
        raise AssertionError("known-source Basic-count total changed")

    strata = Counter(BASICS_BY_RANK.values())
    if strata != Counter({4: 3, 10: 1, 11: 6, 12: 3, 13: 3, 14: 6, 15: 4, 16: 3}):
        raise AssertionError("known-source Basic-count strata changed")

    results = {}
    for candidate_basics in CANDIDATE_BASICS:
        known_differences = [
            paired_bonus_stats(candidate_basics, opponent_basics)["difference"]
            for opponent_basics in BASICS_BY_RANK.values()
        ]
        known_mean = sum(known_differences, Fraction(0)) / len(known_differences)
        unknown_differences = [
            paired_bonus_stats(candidate_basics, opponent_basics)["difference"]
            for opponent_basics in range(1, 61)
        ]
        minimum, maximum = min(unknown_differences), max(unknown_differences)
        min_basic_counts = [
            basics for basics in range(1, 61)
            if paired_bonus_stats(candidate_basics, basics)["difference"] == minimum
        ]
        max_basic_counts = [
            basics for basics in range(1, 61)
            if paired_bonus_stats(candidate_basics, basics)["difference"] == maximum
        ]
        results[str(candidate_basics)] = {
            "known29_mean_difference": known_mean,
            "per_missing_rank_minimum": minimum,
            "per_missing_rank_minimum_at_basics": min_basic_counts,
            "per_missing_rank_maximum": maximum,
            "per_missing_rank_maximum_at_basics": max_basic_counts,
            "full32_mean_lower_bound": (29 * known_mean + 3 * minimum) / 32,
            "full32_mean_upper_bound": (29 * known_mean + 3 * maximum) / 32,
        }

    def encode(value: Fraction) -> dict[str, str | float]:
        return {"fraction": str(value), "decimal": float(value)}

    return {
        "schema": "agent2-full32-mulligan-offer-bounds-v1",
        "deck_size": 60,
        "opening_hand_size": 7,
        "known_source_ranks": 29,
        "missing_ranks": list(MISSING_RANKS),
        "known_source_basics_by_rank": BASICS_BY_RANK,
        "known_source_basic_strata": dict(sorted(strata.items())),
        "missing_rank_basic_count_range": [1, 60],
        "metric": "expected maximum optional offers to opponent minus candidate",
        "candidates": {
            key: {name: encode(value) if isinstance(value, Fraction) else value
                  for name, value in row.items()}
            for key, row in results.items()
        },
        "limitations": [
            "maximum optional offers, not accepted or actual draws",
            "setup-only independent-shuffle model with simultaneous joint resets",
            "equal-rank 32-list mean bounds, not matchup or win-rate evidence",
            "missing source lists are not reconstructed or imputed",
        ],
    }


if __name__ == "__main__":
    print(json.dumps(build_report(), indent=2))
