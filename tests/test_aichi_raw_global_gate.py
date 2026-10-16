"""End-to-end synthetic raw-game controls for the balanced 32-by-two evidence gate."""
import hashlib
import unittest

from scripts.aichi_raw_global_gate import evaluate_balanced_raw_batch


def field(missing_rank=None):
    return "rank,player,archetype,full_list_published\n" + "".join(
        f"{rank},Player {rank},Deck,{'no' if rank == missing_rank else 'yes'}\n"
        for rank in range(1, 33)
    )


def game(rank, seat, trial, *, status="completed", winner="A"):
    first_side = "A" if seat == "first" else "B"
    trace_id = f"{rank}-{seat}-{trial}"
    return {
        "game_id": trace_id,
        "rank": rank, "seat": seat, "seed": trial + 1,
        "candidate_side": "A", "winner_side": winner, "status": status,
        "first_player_side": first_side,
        "first_turn": {
            "firstTurnSlot": 0 if first_side == "A" else 1,
            "firstTurnPlayerId": 101 if first_side == "A" else 202,
            "firstTurnPlayerName": f"research-{first_side}",
            "firstDrawLogName": f"research-{first_side}",
            "verifiedByDrawLog": True,
        },
        "opponent_deck_sha256": hashlib.sha256(
            f"rank-{rank}".encode()
        ).hexdigest(),
        "trace_sha256": hashlib.sha256(trace_id.encode()).hexdigest(),
    }


def batch(horizon=10, missing_rank=None):
    m = field(missing_rank)
    return {
        "schema_version": 2,
        "predeclared_games_per_cell": horizon,
        "engine_slots": [
            {"id": 101, "name": "research-A"},
            {"id": 202, "name": "research-B"},
        ],
        "candidate_deck_sha256": "a" * 64,
        "field_manifest_sha256": hashlib.sha256(m.encode()).hexdigest(),
        "engine_revision": "synthetic-engine",
        "research_revision": "synthetic-research",
        "candidate_policy_revision": "synthetic-candidate",
        "opponent_policy_revision": "synthetic-opponent",
        "ruleset_revision": "synthetic-rules",
        "rng_protocol": "synthetic-independent",
        "games": [
            game(rank, seat, trial)
            for rank in range(1, 33)
            for seat in ("first", "second")
            for trial in range(horizon)
        ],
    }


class BalancedRawGateTests(unittest.TestCase):
    def test_complete_640_synthetic_wins_pass_math_gate(self):
        x = evaluate_balanced_raw_batch(batch(), field(),
                                        predeclared_games_per_cell=10)
        self.assertTrue(x["global_test"]["statistical_threshold_met"])
        self.assertEqual(x["raw_games"], 640)
        self.assertEqual(x["completed_ties_as_nonwins"], 0)

    def test_one_tie_counts_as_nonwin(self):
        b = batch()
        b["games"][0]["winner_side"] = None
        x = evaluate_balanced_raw_batch(b, field(), predeclared_games_per_cell=10)
        self.assertEqual(x["completed_ties_as_nonwins"], 1)
        self.assertEqual(x["global_test"]["nonwins"], 1)
        self.assertFalse(x["global_test"]["statistical_threshold_met"])

    def test_unpublished_rank_blocks_even_complete_batch(self):
        b = batch(missing_rank=23)
        with self.assertRaisesRegex(ValueError, "32 ranks"):
            evaluate_balanced_raw_batch(b, field(23), predeclared_games_per_cell=10)

    def test_missing_actual_starting_seat_blocks(self):
        b = batch()
        b["games"].pop()
        with self.assertRaisesRegex(ValueError, "64-cell"):
            evaluate_balanced_raw_batch(b, field(), predeclared_games_per_cell=10)

    def test_missing_declared_horizon_blocks(self):
        b = batch()
        b.pop("predeclared_games_per_cell")
        with self.assertRaisesRegex(ValueError, "declared horizon"):
            evaluate_balanced_raw_batch(b, field(), predeclared_games_per_cell=10)

    def test_predeclared_horizon_mismatch_blocks(self):
        b = batch(horizon=15)
        with self.assertRaisesRegex(ValueError, "declared horizon"):
            evaluate_balanced_raw_batch(b, field(), predeclared_games_per_cell=10)

    def test_unbalanced_cell_blocks(self):
        b = batch()
        b["games"].append(game(1, "first", 10))
        with self.assertRaisesRegex(ValueError, "Total completed games"):
            evaluate_balanced_raw_batch(b, field(), predeclared_games_per_cell=10)

    def test_failure_blocks_even_with_remaining_valid_games(self):
        b = batch()
        b["games"][0]["winner_side"] = None
        b["games"][0]["status"] = "policy_stall"
        with self.assertRaisesRegex(ValueError, "Failed or unfinished"):
            evaluate_balanced_raw_batch(b, field(), predeclared_games_per_cell=10)

    def test_first_turn_provenance_is_still_enforced(self):
        b = batch()
        b["games"][0]["first_turn"]["firstDrawLogName"] = "wrong"
        with self.assertRaisesRegex(ValueError, "First turn"):
            evaluate_balanced_raw_batch(b, field(), predeclared_games_per_cell=10)


if __name__ == "__main__":
    unittest.main()
