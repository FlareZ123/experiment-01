"""Evaluate a predeclared, balanced full-field hypothesis from validated raw matches.

This only strengthens structural evidence accounting. It cannot establish
opponent policy competence, engine fidelity, or independence of game outcomes.
"""
from __future__ import annotations

from scripts.aichi_balanced_global_gate import balanced_global_test
from scripts.aichi_evidence import read_manifest
from scripts.match_record_contract import evaluate_raw_batch
from scripts.matchup_evidence import SeatRecord


def evaluate_balanced_raw_batch(
    batch: dict, field_csv: str, *,
    predeclared_games_per_cell: int,
    target: str = "0.995",
    confidence: str = "0.95",
) -> dict:
    """Require 64 complete equal-sized, already-validated strata and zero failures."""
    if type(predeclared_games_per_cell) is not int or predeclared_games_per_cell < 1:
        raise ValueError("Positive integer per-cell horizon is required")
    if batch.get("predeclared_games_per_cell") != predeclared_games_per_cell:
        raise ValueError("The batch's declared horizon disagrees with the evaluation horizon")
    if any(not p.published for p in read_manifest(field_csv)):
        raise ValueError("Exact list provenance for all 32 ranks is required")

    checked = evaluate_raw_batch(batch, field_csv)
    if checked["failures"]:
        raise ValueError("Failed or unfinished games cannot enter confirmatory evidence")
    summary = checked["statistical_result"]
    if not summary["complete"]:
        raise ValueError("The full 64-cell rank/actual-starting-seat matrix is missing")
    if checked["finished_games"] != 64 * predeclared_games_per_cell:
        raise ValueError("Total completed games disagree with the predeclared horizon")
    if any(cell["games"] != predeclared_games_per_cell for cell in summary["cells"]):
        raise ValueError("One or more rank/seat cells have a different sample size")

    records = tuple(SeatRecord(
        rank=cell["rank"],
        seat=cell["seat"],
        wins=cell["wins"],
        games=cell["games"],
    ) for cell in summary["cells"])
    global_result = balanced_global_test(records, target=target, confidence=confidence)
    return {
        "provenance": checked["provenance"],
        "raw_games": checked["raw_games"],
        "predeclared_games_per_cell": predeclared_games_per_cell,
        "completed_ties_as_nonwins": checked["finished_ties_as_nonwins"],
        "global_test": global_result,
        "warning": (
            "Statistical arithmetic and raw-record structure only; competitive "
            "policy quality, source authenticity, independence, and engine fidelity "
            "require separate verification before any win-rate claim"
        ),
    }
