"""Source-locked fixed-horizon full-field inference from validated raw matches.

Structural evidence accounting only. It cannot independently certify source
legality, trace replay, game independence, engine semantics, or player skill.
"""
from __future__ import annotations

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


def evaluate_balanced_raw_batch(
    batch: dict, field_csv: str, *,
    source_deck_digests: Mapping[int, str],
    expected_candidate_deck_sha256: str,
    predeclared_games_per_cell: int,
    target: str = "0.995",
    confidence: str = "0.95",
) -> dict:
    """Require source inventory, 64 equal strata, exact turn proof and zero failures."""
    if type(predeclared_games_per_cell) is not int or predeclared_games_per_cell < 1:
        raise ValueError("Positive integer per-cell horizon is required")
    if (type(batch.get("predeclared_games_per_cell")) is not int or
            batch["predeclared_games_per_cell"] != predeclared_games_per_cell):
        raise ValueError("The batch's declared horizon disagrees with the evaluation horizon")
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
    checked = evaluate_raw_batch(batch, field_csv)
    seed_list = [game["seed"] for game in batch["games"]]
    if len(seed_list) != len(set(seed_list)):
        raise ValueError("Global RNG seeds must be unique across all rank and seat cells")
    if checked["failures"]:
        raise ValueError("Failed or unfinished games cannot enter confirmatory evidence")
    if not checked["all_completed_traces_verified"]:
        raise ValueError("All completed games require verified action traces; digest-only records remain diagnostic")
    for game in batch["games"]:
        if game["opponent_deck_sha256"] != source_deck_digests[game["rank"]]:
            raise ValueError(f"Opponent rank {game['rank']} deck does not match its exact source digest")
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
        "provenance": {**checked["provenance"], "source_inventory_digest_sha256": expected_source_sha,
                       "registered_candidate_deck_sha256": expected_candidate_deck_sha256},
        "raw_games": checked["raw_games"],
        "predeclared_games_per_cell": predeclared_games_per_cell,
        "completed_ties_as_nonwins": checked["finished_ties_as_nonwins"],
        "all_completed_traces_verified": checked["all_completed_traces_verified"],
        "competitive_evidence_qualified": False,
        "global_test": global_result,
        "warning": (
            "Statistical arithmetic and raw-record/source-hash consistency only; "
            "externally vetted source lists, policy quality, independence, trace "
            "replay, and engine fidelity require separate verification"
        ),
    }
