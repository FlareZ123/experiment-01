"""Validate replayable match records and preserve incomplete-engine failures."""
from collections import defaultdict
from hashlib import sha256

from scripts.aichi_evidence import read_manifest
from scripts.matchup_evidence import SeatRecord, summarize

FAILURES = ("timeout", "policy_stall", "invalid_deck", "unsupported_card", "engine_exception")


def _hash(value):
    return isinstance(value, str) and len(value) == 64 and all(c in "0123456789abcdef" for c in value)


def evaluate_raw_batch(batch: dict, field_csv: str) -> dict:
    """Summarize engine-normalized games, recording failures separately."""
    if batch.get("schema_version") != 1:
        raise ValueError("Unknown schema version")
    keys = ("candidate_deck_sha256", "field_manifest_sha256", "engine_revision",
            "research_revision", "candidate_policy_revision",
            "opponent_policy_revision", "ruleset_revision", "rng_protocol")
    if not _hash(batch.get(keys[0])) or batch.get(keys[1]) != sha256(field_csv.encode()).hexdigest():
        raise ValueError("Deck/field digest invalid")
    if any(not isinstance(batch.get(k), str) or not batch[k].strip() for k in keys[2:]):
        raise ValueError("Incomplete run provenance")
    if not isinstance(batch.get("games"), list):
        raise ValueError("games must be a list")

    published = {p.rank for p in read_manifest(field_csv) if p.published}
    ids, seeds, rank_decks = set(), set(), {}
    counts = defaultdict(lambda: [0, 0])
    failures = []
    ties = 0
    for g in batch["games"]:
        rank, seat, seed = g["rank"], g["seat"], g["seed"]
        side, winner, status = g["candidate_side"], g["winner_side"], g["status"]
        key = (rank, seat)
        if not isinstance(g["game_id"], str) or not g["game_id"] or g["game_id"] in ids:
            raise ValueError("Duplicate or missing game ID")
        ids.add(g["game_id"])
        if type(rank) is not int or rank not in range(1, 33) or seat not in ("first", "second"):
            raise ValueError("Invalid rank or turn order")
        if type(seed) is not int or not 0 <= seed <= 0xffffffff or (rank, seat, seed) in seeds:
            raise ValueError("Invalid or repeated within-cell seed")
        seeds.add((rank, seat, seed))
        if side not in ("A", "B"):
            raise ValueError("Candidate engine seat must be A or B")
        deck = g["opponent_deck_sha256"]
        if not _hash(deck) or not _hash(g["trace_sha256"]):
            raise ValueError("Missing deck or trace SHA-256")
        if rank in rank_decks and rank_decks[rank] != deck:
            raise ValueError("Opponent deck changed within placement")
        rank_decks[rank] = deck
        if status == "completed":
            if rank not in published or winner not in ("A", "B", None):
                raise ValueError("Invalid completed exact-list result")
            counts[key][1] += 1
            counts[key][0] += winner == side
            ties += winner is None
        elif status in FAILURES and winner is None:
            failures.append({"game_id": g["game_id"], "rank": rank,
                             "seat": seat, "reason": status})
        else:
            raise ValueError("Failure cannot be a win; unknown status")

    stats = summarize(SeatRecord(rank, seat, w, n) for (rank, seat), (w, n) in counts.items())
    return {
        "provenance": {k: batch[k] for k in keys},
        "raw_games": len(batch["games"]),
        "finished_games": sum(n for w, n in counts.values()),
        "finished_ties_as_nonwins": ties,
        "failures": failures,
        "statistical_result": stats,
        "arithmetic_threshold_with_no_failures": not failures and stats["statistical_threshold_met"],
        "warning": "Game-rule correctness and playing-policy skill are not established",
    }
