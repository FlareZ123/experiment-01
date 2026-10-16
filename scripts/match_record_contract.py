"""Validate replayable match records and preserve incomplete-engine failures."""
from collections import defaultdict
from hashlib import sha256

from scripts.action_trace_integrity import verify_action_trace
from scripts.aichi_evidence import read_manifest
from scripts.matchup_evidence import SeatRecord, summarize

FAILURES = ("timeout", "policy_stall", "invalid_deck", "unsupported_card", "engine_exception")


def _hash(value):
    return isinstance(value, str) and len(value) == 64 and all(c in "0123456789abcdef" for c in value)


def evaluate_raw_batch(batch: dict, field_csv: str) -> dict:
    """Verify completed-game turn order; retain honest pre-turn engine failures."""
    if batch.get("schema_version") != 2:
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
    slots = batch.get("engine_slots")
    if (not isinstance(slots, list) or len(slots) != 2 or
            any(not isinstance(p, dict) or type(p.get("id")) is not int or
                not isinstance(p.get("name"), str) or not p["name"] for p in slots) or
            slots[0]["id"] == slots[1]["id"] or
            slots[0]["name"] == slots[1]["name"]):
        raise ValueError("Require distinct engine slot IDs and player names")

    published = {p.rank for p in read_manifest(field_csv) if p.published}
    ids, seeds, rank_decks = set(), set(), {}
    counts = defaultdict(lambda: [0, 0])
    failures = []
    ties = 0
    verified_completed_traces = 0
    for g in batch["games"]:
        rank, seat, seed = g["rank"], g["seat"], g["seed"]
        side, winner, status = g["candidate_side"], g["winner_side"], g["status"]
        key = (rank, seat)
        if not isinstance(g["game_id"], str) or not g["game_id"] or g["game_id"] in ids:
            raise ValueError("Duplicate or missing game ID")
        ids.add(g["game_id"])
        if type(rank) is not int or rank not in range(1, 33):
            raise ValueError("Invalid rank")
        pre_turn_failure = status in FAILURES and winner is None
        if status != "completed" and not pre_turn_failure:
            raise ValueError("Failure cannot be a win; unknown status")
        if type(seed) is not int or not 0 <= seed <= 0xffffffff or (rank, seat, seed) in seeds:
            raise ValueError("Invalid or repeated within-cell seed")
        seeds.add((rank, seat, seed))
        if side not in ("A", "B"):
            raise ValueError("Candidate engine seat must be A or B")
        order = g.get("first_turn")
        turn_verified = isinstance(order, dict)
        if not turn_verified:
            # Deck rejection and setup failures can precede the first turn.
            # Such failures must have an unknown seat rather than fabricated proof.
            if (not pre_turn_failure or seat != "unverified" or
                    g.get("first_player_side") is not None or order is not None):
                raise ValueError("Missing first-turn proof requires a pre-turn failure and unverified seat")
        else:
            if seat not in ("first", "second"):
                raise ValueError("Verified first-turn record requires first or second seat")
            slot = order.get("firstTurnSlot")
            name = order.get("firstTurnPlayerName")
            draw = order.get("firstDrawLogName")
            first_id = order.get("firstTurnPlayerId")
            if (type(slot) is not int or slot not in (0, 1) or
                    first_id != slots[slot]["id"] or
                    name != slots[slot]["name"] or name != draw or
                    order.get("verifiedByDrawLog") is not True):
                raise ValueError("First turn contradicts engine slots or earliest draw log")
            first_side = "A" if slot == 0 else "B"
            if g.get("first_player_side") != first_side:
                raise ValueError("Declared first-player side contradicts engine turn slot")
            if seat != ("first" if side == first_side else "second"):
                raise ValueError("Candidate turn order contradicts engine first-player side")
        deck = g["opponent_deck_sha256"]
        if not _hash(deck) or not _hash(g["trace_sha256"]):
            raise ValueError("Missing deck or trace SHA-256")
        trace_verified = "action_trace" in g
        if trace_verified:
            verify_action_trace(g["action_trace"], g["trace_sha256"])
        if rank in rank_decks and rank_decks[rank] != deck:
            raise ValueError("Opponent deck changed within placement")
        rank_decks[rank] = deck
        if status == "completed":
            if rank not in published or winner not in ("A", "B", None):
                raise ValueError("Invalid completed exact-list result")
            counts[key][1] += 1
            verified_completed_traces += int(trace_verified)
            counts[key][0] += winner == side
            ties += winner is None
        elif status in FAILURES and winner is None:
            failures.append({"game_id": g["game_id"], "rank": rank,
                             "seat": seat, "reason": status,
                             "first_turn_verified": turn_verified})
        else:
            raise ValueError("Failure cannot be a win; unknown status")

    stats = summarize(SeatRecord(rank, seat, w, n) for (rank, seat), (w, n) in counts.items())
    finished = sum(n for w, n in counts.values())
    all_completed_traces_verified = finished > 0 and verified_completed_traces == finished
    return {
        "provenance": {**{k: batch[k] for k in keys}, "engine_slots": slots},
        "raw_games": len(batch["games"]),
        "finished_games": finished,
        "verified_completed_traces": verified_completed_traces,
        "digest_only_completed_games": finished - verified_completed_traces,
        "all_completed_traces_verified": all_completed_traces_verified,
        "trace_integrity_promotion_eligible": all_completed_traces_verified and not failures,
        "competitive_evidence_qualified": False,
        "finished_ties_as_nonwins": ties,
        "failures": failures,
        "pre_first_turn_failures": sum(not f["first_turn_verified"] for f in failures),
        "statistical_result": stats,
        "arithmetic_threshold_with_no_failures": not failures and stats["statistical_threshold_met"],
        "warning": "Trace integrity does not establish replayability, game-rule correctness or playing-policy skill",
    }
