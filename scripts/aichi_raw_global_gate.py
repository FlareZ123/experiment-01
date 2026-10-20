"""Source-locked fixed-horizon full-field inference from validated raw matches.

Structural evidence accounting only. It cannot independently certify source
legality, trace replay, game independence, engine semantics, or player skill.
"""
from __future__ import annotations

from collections import Counter
from collections.abc import Mapping
from hashlib import sha256
import json

from scripts.aichi_balanced_global_gate import balanced_global_test
from scripts.aichi_evidence import read_manifest
from scripts.match_record_contract import evaluate_raw_batch
from scripts.matchup_evidence import SeatRecord


def source_inventory_digest(source_deck_digests: Mapping[int, str]) -> str:
    """Digest exactly 32 rank-indexed canonical source deck SHA-256 values."""
    if not isinstance(source_deck_digests, Mapping) or set(source_deck_digests) != set(range(1, 33)):
        raise ValueError("Source digest map must contain every rank 1 through 32")
    values = []
    for rank in range(1, 33):
        digest = source_deck_digests[rank]
        if (not isinstance(digest, str) or len(digest) != 64 or
                any(c not in "0123456789abcdef" for c in digest)):
            raise ValueError("Source digest map contains a malformed lowercase SHA-256")
        values.append((rank, digest))
    serialized = json.dumps(values, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return sha256(serialized).hexdigest()


def _verify_frozen_source_raw_batch(
    batch: dict, field_csv: str, *,
    source_deck_digests: Mapping[int, str],
    expected_candidate_deck_sha256: str,
    expected_trials: list[dict],
) -> tuple[dict, str]:
    """Shared exact-field, frozen candidate, full-trace and schedule preflight."""
    if not isinstance(expected_trials, list) or not expected_trials:
        raise ValueError("Independent predeclared trial schedule is required")
    if any(not p.published for p in read_manifest(field_csv)):
        raise ValueError("Exact list provenance for all 32 ranks is required")

    if (not isinstance(expected_candidate_deck_sha256, str) or
            len(expected_candidate_deck_sha256) != 64 or
            any(c not in "0123456789abcdef" for c in expected_candidate_deck_sha256)):
        raise ValueError("Expected candidate deck fingerprint must be a lowercase SHA-256")
    if batch.get("candidate_deck_sha256") != expected_candidate_deck_sha256:
        raise ValueError("Batch candidate deck fingerprint differs from the frozen registered candidate")
    expected_source_sha = source_inventory_digest(source_deck_digests)
    if batch.get("source_inventory_digest_sha256") != expected_source_sha:
        raise ValueError("Batch source inventory differs from the externally supplied source map")
    seed_list = [game["seed"] for game in batch["games"]]
    if len(seed_list) != len(set(seed_list)):
        raise ValueError("Global RNG seeds must be unique across all rank and seat cells")
    checked = evaluate_raw_batch(
        batch, field_csv,
        source_hashes=dict(source_deck_digests),
        candidate_hash=expected_candidate_deck_sha256,
        expected_trials=expected_trials,
    )
    if checked["failures"]:
        raise ValueError("Failed or unfinished games cannot enter confirmatory evidence")
    if not checked["all_completed_traces_verified"]:
        raise ValueError("All completed games require verified action traces; digest-only records remain diagnostic")
    if not checked["all_completed_terminals_bound"]:
        raise ValueError("All completed games require engine-terminal-bound winners")
    if not checked["sampling_frame_input_integrity_promotion_eligible"]:
        raise ValueError("Full source, candidate, trace, terminal and schedule integrity required")
    for game in batch["games"]:
        if game["opponent_deck_sha256"] != source_deck_digests[game["rank"]]:
            raise ValueError(f"Opponent rank {game['rank']} deck does not match its exact source digest")
    return checked, expected_source_sha


def evaluate_balanced_raw_batch(
    batch: dict, field_csv: str, *,
    source_deck_digests: Mapping[int, str],
    expected_candidate_deck_sha256: str,
    predeclared_games_per_cell: int,
    expected_trials: list[dict],
    target: str = "0.995",
    confidence: str = "0.95",
    require_physical_seat_balance: bool = False,
) -> dict:
    """Require 64 rank/start cells, optionally also 128 rank/start/engine-seat cells.

    The physical-seat option describes the target as uniformly weighted over all
    four engine-seat and actual-start combinations per rank. It does not attest
    independent sampling, randomization, decision-policy fidelity or paper rules.
    """
    if type(predeclared_games_per_cell) is not int or predeclared_games_per_cell < 1:
        raise ValueError("Positive integer per-cell horizon is required")
    if type(require_physical_seat_balance) is not bool:
        raise ValueError("Physical-seat balance flag must be a boolean")
    if not isinstance(expected_trials, list) or not expected_trials:
        raise ValueError("Independent predeclared trial schedule is required")
    if (type(batch.get("predeclared_games_per_cell")) is not int or
            batch["predeclared_games_per_cell"] != predeclared_games_per_cell):
        raise ValueError("The batch's declared horizon disagrees with the evaluation horizon")
    checked, expected_source_sha = _verify_frozen_source_raw_batch(
        batch, field_csv,
        source_deck_digests=source_deck_digests,
        expected_candidate_deck_sha256=expected_candidate_deck_sha256,
        expected_trials=expected_trials,
    )
    summary = checked["statistical_result"]
    if not summary["complete"]:
        raise ValueError("The full 64-cell rank/actual-starting-seat matrix is missing")
    multiplier = 2 if require_physical_seat_balance else 1
    if checked["finished_games"] != 64 * multiplier * predeclared_games_per_cell:
        raise ValueError("Total completed games disagree with the predeclared horizon")
    if any(cell["games"] != multiplier * predeclared_games_per_cell for cell in summary["cells"]):
        raise ValueError("One or more rank/start cells have a different sample size")
    physical_seat_cells = []
    if require_physical_seat_balance:
        observed = Counter((g["rank"], g["seat"], g["candidate_side"])
                           for g in batch["games"])
        physical_seat_cells = [
            {"rank": rank, "actual_start": seat, "candidate_side": side,
             "games": observed[rank, seat, side]}
            for rank in range(1, 33)
            for seat in ("first", "second")
            for side in ("A", "B")
        ]
        if any(cell["games"] != predeclared_games_per_cell
               for cell in physical_seat_cells):
            raise ValueError("The 128 rank/start/physical-seat cells are unbalanced")

    records = tuple(SeatRecord(
        rank=cell["rank"],
        seat=cell["seat"],
        wins=cell["wins"],
        games=cell["games"],
    ) for cell in summary["cells"])
    global_result = balanced_global_test(records, target=target, confidence=confidence)
    return {
        "provenance": {**checked["provenance"], "source_inventory_digest_sha256": expected_source_sha,
                       "registered_candidate_deck_sha256": expected_candidate_deck_sha256},
        "raw_games": checked["raw_games"],
        "predeclared_games_per_cell": predeclared_games_per_cell,
        "physical_seat_balance_required": require_physical_seat_balance,
        "physical_seat_cells": physical_seat_cells,
        "completed_ties_as_nonwins": checked["finished_ties_as_nonwins"],
        "all_completed_traces_verified": checked["all_completed_traces_verified"],
        "all_completed_terminals_bound": checked["all_completed_terminals_bound"],
        "schedule_bound": checked["schedule_bound"],
        "scheduled_trial_count": checked["scheduled_trial_count"],
        "competitive_evidence_qualified": False,
        "global_test": global_result,
        "warning": (
            "Statistical arithmetic, registered-trial and raw-record consistency only; "
            "externally vetted source lists, policy quality, independence, authenticated "
            "trace replay, engine fidelity and sampling randomization require separate verification"
        ),
    }
