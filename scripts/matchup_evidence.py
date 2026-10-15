"""Conservative, seat-balanced evidence summaries for fixed-deck benchmarks.

Requires SciPy. Games in each (opponent rank, starting seat) cell must be
independent trials of a *fixed* deck and policy under a stable test environment.
A tie, draw, or unfinished game is not counted as a win.
"""
from __future__ import annotations

from dataclasses import dataclass
from collections.abc import Iterable, Sequence

from scipy.stats import binomtest


@dataclass(frozen=True)
class SeatRecord:
    rank: int
    seat: str
    wins: int
    games: int


def exact_lower(wins: int, games: int, alpha: float) -> float:
    """One-sided Clopper-Pearson lower bound on independent Bernoulli wins."""
    if type(wins) is not int or type(games) is not int:
        raise TypeError("wins and games must be integers")
    if games < 1 or not 0 <= wins <= games:
        raise ValueError("require 0 <= wins <= games and games >= 1")
    if not 0 < alpha < 1:
        raise ValueError("require 0 < alpha < 1")
    return float(
        binomtest(wins, games, alternative="greater")
        .proportion_ci(confidence_level=1 - alpha, method="exact")
        .low
    )


def minimum_all_wins(target: float, alpha: float) -> int:
    """Smallest n with one-sided all-wins lower bound strictly above target."""
    from math import floor, log

    if not 0 < target < 1 or not 0 < alpha < 1:
        raise ValueError("target and alpha must lie strictly between 0 and 1")
    guess = max(1, floor(log(alpha) / log(target)))
    while alpha ** (1 / guess) <= target:
        guess += 1
    while guess > 1 and alpha ** (1 / (guess - 1)) > target:
        guess -= 1
    return guess


def summarize(
    records: Iterable[SeatRecord],
    *,
    placements: Sequence[int] = tuple(range(1, 33)),
    confidence: float = 0.95,
    target: float = 0.995,
) -> dict:
    """Report a simultaneous lower bound for an equal-rank, equal-seat field.

    Unobserved cells have lower bound zero. Each observed cell receives a
    Bonferroni-adjusted one-sided exact binomial bound; averaging the cell
    bounds yields a simultaneous lower bound for the target field average.
    """
    if not 0 < confidence < 1 or not 0 < target < 1:
        raise ValueError("confidence and target must lie strictly between 0 and 1")
    if not placements or len(set(placements)) != len(placements):
        raise ValueError("placements must be a nonempty sequence of unique ranks")
    if any(type(rank) is not int or rank < 1 for rank in placements):
        raise ValueError("placements must contain positive integer ranks")

    seats = ("first", "second")
    expected = {(rank, seat) for rank in placements for seat in seats}
    observed: dict[tuple[int, str], SeatRecord] = {}
    for record in records:
        key = (record.rank, record.seat)
        if key not in expected:
            raise ValueError(f"unexpected opponent rank or seat: {key}")
        if key in observed:
            raise ValueError(f"duplicate opponent rank and seat: {key}")
        if type(record.wins) is not int or type(record.games) is not int:
            raise TypeError("wins and games must be integers")
        if record.games < 1 or not 0 <= record.wins <= record.games:
            raise ValueError("each observed cell needs 0 <= wins <= games, games >= 1")
        observed[key] = record

    family = len(expected)
    alpha = (1 - confidence) / family
    cells = []
    for rank in placements:
        for seat in seats:
            record = observed.get((rank, seat))
            cells.append({
                "rank": rank,
                "seat": seat,
                "games": record.games if record else 0,
                "wins": record.wins if record else 0,
                "point_rate": record.wins / record.games if record else None,
                "lower": exact_lower(record.wins, record.games, alpha) if record else 0.0,
                "status": "tested" if record else "missing",
            })

    complete = len(observed) == family
    mean_lower = sum(cell["lower"] for cell in cells) / family
    mean_point = (
        sum(cell["point_rate"] for cell in cells) / family if complete else None
    )
    return {
        "field_rank_count": len(placements),
        "strata": family,
        "confidence": confidence,
        "target": target,
        "bonferroni_alpha_per_stratum": alpha,
        "complete": complete,
        "missing": [
            {"rank": cell["rank"], "seat": cell["seat"]}
            for cell in cells if cell["status"] == "missing"
        ],
        "equal_rank_equal_seat_point_rate": mean_point,
        "simultaneous_lower": mean_lower,
        "statistical_threshold_met": complete and mean_lower > target,
        "cells": cells,
    }
