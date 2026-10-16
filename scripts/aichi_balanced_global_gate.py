"""Conservative one-sided global test for balanced Aichi rank/seat outcomes.

Only statistical arithmetic; source legality, fixed policies, gameplay fidelity,
and independent trials must be established outside this module.
"""
from __future__ import annotations

from collections.abc import Iterable
from fractions import Fraction

from scipy.stats import binom

from scripts.matchup_evidence import SeatRecord


def balanced_global_test(
    records: Iterable[SeatRecord], *, target: str = "0.995", confidence: str = "0.95"
) -> dict:
    """Test the equal-rank/equal-seat win probability at a predeclared horizon.

    Hoeffding's binomial comparison bounds the upper Poisson-binomial tail
    when wins-1 >= total_games * target. Otherwise return p=1 conservatively.
    """
    p0, alpha = Fraction(target), 1 - Fraction(confidence)
    if not 0 < p0 < 1 or not 0 < alpha < 1:
        raise ValueError("target and confidence must lie between 0 and 1")
    expected = {(rank, seat) for rank in range(1, 33) for seat in ("first", "second")}
    observed = {}
    for r in records:
        key = (r.rank, r.seat)
        if key not in expected or key in observed:
            raise ValueError("Unknown or duplicate rank/seat cell")
        if type(r.wins) is not int or type(r.games) is not int or not 0 <= r.wins <= r.games:
            raise ValueError("Invalid win/game counts")
        observed[key] = r
    if set(observed) != expected:
        raise ValueError("All 64 rank/seat cells are required")
    sizes = {r.games for r in observed.values()}
    if len(sizes) != 1 or next(iter(sizes)) == 0:
        raise ValueError("Each cell must have an identical positive trial count")
    games = sum(r.games for r in observed.values())
    wins = sum(r.wins for r in observed.values())
    applicable = wins - 1 >= games * p0
    p_value = float(binom.sf(wins - 1, games, float(p0))) if applicable else 1.0
    return {
        "ranks": 32, "seats": 2, "games_per_cell": next(iter(sizes)),
        "games": games, "wins": wins, "nonwins": games - wins,
        "target": str(p0), "confidence": str(1 - alpha),
        "hoeffding_comparison_applicable": applicable,
        "conservative_p_value": p_value,
        "statistical_threshold_met": applicable and p_value <= float(alpha),
        "warning": "Arithmetic only; game and policy validity are not certified",
    }
