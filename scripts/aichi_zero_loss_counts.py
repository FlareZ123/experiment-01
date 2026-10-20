"""Sharp all-win composite-null bound for fixed, unequally sampled cells.

A zero-loss inference tool only. Registered deck/policy, source provenance,
actual deal independence, paper rules and a competition clock are external.
"""
from __future__ import annotations

from fractions import Fraction
from math import exp, log


def sharp_zero_loss_null_probability(
    games_per_cell: list[int], *, target: str = "0.995"
) -> float:
    """Maximum chance of all wins when equally weighted cell mean is <= target.

    For cell loss probabilities q_i, maximize the independent-game likelihood
    product_i (1-q_i)^n_i, subject to sum_i q_i >= cells*(1-target).
    A convex KKT water-filling solution gives q_i=max(0, 1-n_i/lambda)
    in nonempty cells. Empty cells absorb null failure mass first.

    This is conditional on independently registered sampling and the realized
    cell counts, with all games completed; it never certifies those assumptions.
    """
    if (not isinstance(games_per_cell, list) or not games_per_cell or
            any(type(n) is not int or n < 0 for n in games_per_cell)):
        raise ValueError("Require a nonempty list of nonnegative integer counts")
    p0 = Fraction(target)
    if not 0 < p0 < 1:
        raise ValueError("Target win probability must lie strictly between 0 and 1")
    failure_mass = float(len(games_per_cell) * (1 - p0))
    empty_count = games_per_cell.count(0)
    if failure_mass <= empty_count:
        return 1.0
    positive = [n for n in games_per_cell if n]
    residual = failure_mass - empty_count
    if residual >= len(positive):
        return 0.0

    def assigned(lam: float) -> float:
        return sum(max(0.0, 1.0 - n / lam) for n in positive)

    lower = float(min(positive))
    upper = lower
    while assigned(upper) < residual:
        upper *= 2.0
    for _ in range(96):
        mid = (lower + upper) / 2.0
        if assigned(mid) < residual:
            lower = mid
        else:
            upper = mid
    return exp(sum(n * log(n / upper) for n in positive if n < upper))


def assess_zero_loss_cells(
    counts: list[int], *, total_wins: int, target: str = "0.995",
    confidence: str = "0.95"
) -> dict:
    """Return a sharp one-sided all-win test; non-all-win data are not tested."""
    if (type(total_wins) is not int or total_wins < 0 or
            not isinstance(counts, list) or not counts or
            any(type(n) is not int or n < 0 for n in counts)):
        raise ValueError("Invalid cell counts or win count")
    total = sum(counts)
    if total_wins > total:
        raise ValueError("Win count exceeds completed games")
    p0 = Fraction(target)
    if not 0 < p0 < 1:
        raise ValueError("Target win probability must lie strictly between 0 and 1")
    alpha = 1 - Fraction(confidence)
    if not 0 < alpha < 1:
        raise ValueError("Confidence must lie strictly between 0 and 1")
    p = (sharp_zero_loss_null_probability(counts, target=target)
         if total_wins == total and total > 0 else None)
    return {
        "cells": len(counts),
        "games": total,
        "wins": total_wins,
        "nonwins": total - total_wins,
        "unobserved_cells": counts.count(0),
        "target": str(p0),
        "confidence": str(1 - alpha),
        "all_win_test_applicable": p is not None,
        "sharp_all_win_null_probability": p,
        "statistical_threshold_met": p is not None and p <= float(alpha),
        "warning": "Zero-loss arithmetic only; native gameplay and sample integrity are external",
    }
