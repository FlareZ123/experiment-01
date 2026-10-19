"""Anytime-valid aggregate Aichi Top-32 evidence from complete balanced blocks.

Statistics only. Callers must separately validate fixed exact 60-card source decks,
independent randomized games, policy fidelity, paper rules and match outcomes.
"""
from __future__ import annotations

from dataclasses import dataclass
from math import exp, isfinite, log, log1p
from typing import Sequence


@dataclass(frozen=True)
class Trial:
    rank: int
    candidate_first: bool
    won: bool
    seed: str


@dataclass(frozen=True)
class BalancedEvidence:
    complete_blocks: int
    games: int
    wins: int
    nonwins: int
    log_e_value: float
    max_log_e_value: float
    anytime_p_upper: float
    first_threshold_block: int | None
    target_demonstrated_statistically: bool


_CELLS = frozenset((rank, first) for rank in range(1, 33) for first in (True, False))


def flawless_blocks_needed(target: float = 0.995, confidence: float = 0.95,
                            alternative: float = 1.0) -> int:
    """Number of 64-game perfect blocks sufficient for the chosen e-test."""
    _check_probabilities(target, confidence, alternative)
    from math import ceil
    return ceil(-log1p(-confidence) / (64 * log(alternative / target)))


def _check_probabilities(target: float, confidence: float, alternative: float) -> None:
    if any(type(x) not in (int, float) or not isfinite(x)
           for x in (target, confidence, alternative)):
        raise ValueError("Probabilities must be finite real numbers")
    if not (0 < target < alternative <= 1 and 0 < confidence < 1):
        raise ValueError("Require 0 < target < alternative <= 1 and 0 < confidence < 1")


def assess_balanced_blocks(batches: Sequence[Sequence[Trial]], target: float = 0.995,
                           confidence: float = 0.95,
                           alternative: float = 1.0) -> BalancedEvidence:
    """Test H0: equal-rank/equal-start mean win chance <= target.

    Each 64-game batch must contain every (rank, true starting order) exactly once,
    with independently generated games under one frozen candidate, opponent field,
    simulator and bilateral policy. Outcomes are independent between and within
    batches; all 64 cell-specific win probabilities are stable across batches.
    Draws, disqualifications and unfinished games must be represented as nonwins.

    The per-game likelihood ratio uses a *common* alternative Bernoulli parameter
    against target. Its product is a nonnegative supermartingale at COMPLETED-BATCH
    boundaries under the composite field-average null, even when 64 cells have
    different win probabilities. Monitoring is valid only at those boundaries.
    """
    _check_probabilities(target, confidence, alternative)
    seen_seeds: set[str] = set()
    log_e = 0.0
    max_log_e = 0.0
    wins = 0
    nonwins = 0
    first_crossing = None
    threshold = -log1p(-confidence)
    log_win = log(alternative / target)
    log_nonwin = log1p(-alternative) - log1p(-target) if alternative < 1 else float("-inf")

    for block_number, batch in enumerate(batches, 1):
        if len(batch) != 64:
            raise ValueError("Each complete block must have exactly 64 trials")
        cells: set[tuple[int, bool]] = set()
        block_wins = 0
        for trial in batch:
            if not isinstance(trial, Trial):
                raise TypeError("Expected Trial records")
            if type(trial.rank) is not int or not 1 <= trial.rank <= 32:
                raise ValueError("Rank must be an integer from 1 to 32")
            if type(trial.candidate_first) is not bool or type(trial.won) is not bool:
                raise ValueError("Starting order and won must be booleans")
            if type(trial.seed) is not str or not trial.seed:
                raise ValueError("Every trial must have a nonempty independent seed ID")
            cell = (trial.rank, trial.candidate_first)
            if cell in cells:
                raise ValueError("Duplicate rank/start cell in a block")
            if trial.seed in seen_seeds:
                raise ValueError("Reused seed ID violates independent-trial contract")
            cells.add(cell)
            seen_seeds.add(trial.seed)
            block_wins += int(trial.won)
        if cells != _CELLS:
            raise ValueError("Incomplete rank/start coverage")
        block_nonwins = 64 - block_wins
        wins += block_wins
        nonwins += block_nonwins
        if alternative == 1.0:
            log_e = float("-inf") if block_nonwins else log_e + 64 * log_win
        else:
            log_e += block_wins * log_win + block_nonwins * log_nonwin
        max_log_e = max(max_log_e, log_e)
        if first_crossing is None and log_e >= threshold:
            first_crossing = block_number

    return BalancedEvidence(
        complete_blocks=len(batches), games=64 * len(batches), wins=wins,
        nonwins=nonwins, log_e_value=log_e, max_log_e_value=max_log_e,
        anytime_p_upper=exp(-max_log_e), first_threshold_block=first_crossing,
        target_demonstrated_statistically=first_crossing is not None,
    )
