"""End-to-end synthetic raw-game controls for the balanced 32-by-two evidence gate."""
import hashlib
import unittest

from scripts.aichi_raw_global_gate import evaluate_balanced_raw_batch, source_inventory_digest



def source_decks():
    return {
        rank: hashlib.sha256(f"rank-{rank}".encode()).hexdigest()
        for rank in range(1, 33)
    }


def assess(source_batch, manifest, *, predeclared_games_per_cell):
    return evaluate_balanced_raw_batch(
        source_batch, manifest, source_deck_digests=source_decks(),
        expected_candidate_deck_sha256="a" * 64,
        predeclared_games_per_cell=predeclared_games_per_cell,
    )


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
        "rank": rank, "seat": seat, "seed": rank * 10000 + (0 if seat == "first" else 5000) + trial + 1,
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
        "source_inventory_digest_sha256": source_inventory_digest(source_decks()),
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
        x = assess(batch(), field(),
                                        predeclared_games_per_cell=10)
        self.assertTrue(x["global_test"]["statistical_threshold_met"])
        self.assertEqual(x["raw_games"], 640)
        self.assertEqual(x["completed_ties_as_nonwins"], 0)

    def test_one_tie_counts_as_nonwin(self):
        b = batch()
        b["games"][0]["winner_side"] = None
        x = assess(b, field(), predeclared_games_per_cell=10)
        self.assertEqual(x["completed_ties_as_nonwins"], 1)
        self.assertEqual(x["global_test"]["nonwins"], 1)
        self.assertFalse(x["global_test"]["statistical_threshold_met"])

    def test_unpublished_rank_blocks_even_complete_batch(self):
        b = batch(missing_rank=23)
        with self.assertRaisesRegex(ValueError, "32 ranks"):
            assess(b, field(23), predeclared_games_per_cell=10)

    def test_missing_actual_starting_seat_blocks(self):
        b = batch()
        b["games"] = [g for g in b["games"] if not (g["rank"] == 32 and g["seat"] == "second")]
        with self.assertRaisesRegex(ValueError, "64-cell"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_missing_declared_horizon_blocks(self):
        b = batch()
        b.pop("predeclared_games_per_cell")
        with self.assertRaisesRegex(ValueError, "declared horizon"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_predeclared_horizon_mismatch_blocks(self):
        b = batch(horizon=15)
        with self.assertRaisesRegex(ValueError, "declared horizon"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_unbalanced_cell_blocks(self):
        b = batch()
        b["games"].append(game(1, "first", 10))
        with self.assertRaisesRegex(ValueError, "Total completed games"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_failure_blocks_even_with_remaining_valid_games(self):
        b = batch()
        b["games"][0]["winner_side"] = None
        b["games"][0]["status"] = "policy_stall"
        with self.assertRaisesRegex(ValueError, "Failed or unfinished"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_first_turn_provenance_is_still_enforced(self):
        b = batch()
        b["games"][0]["first_turn"]["firstDrawLogName"] = "wrong"
        with self.assertRaisesRegex(ValueError, "First turn"):
            assess(b, field(), predeclared_games_per_cell=10)


    def test_source_manifest_hash_is_required(self):
        b = batch()
        b.pop("source_inventory_digest_sha256")
        with self.assertRaisesRegex(ValueError, "source inventory"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_source_deck_identity_checked_across_whole_rank(self):
        b = batch()
        for g in b["games"]:
            if g["rank"] == 17:
                g["opponent_deck_sha256"] = "f" * 64
        with self.assertRaisesRegex(ValueError, "Opponent rank 17 deck"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_source_map_must_cover_every_rank(self):
        b = batch()
        damaged_source_map = source_decks()
        del damaged_source_map[28]
        with self.assertRaisesRegex(ValueError, "every rank"):
            evaluate_balanced_raw_batch(
                b, field(), source_deck_digests=damaged_source_map,
                expected_candidate_deck_sha256="a" * 64,
                predeclared_games_per_cell=10,
            )

    def test_candidate_batch_is_bound_to_registered_candidate(self):
        b = batch()
        b["candidate_deck_sha256"] = "b" * 64
        with self.assertRaisesRegex(ValueError, "frozen registered candidate"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_invalid_registered_candidate_fingerprint_fails(self):
        b = batch()
        with self.assertRaisesRegex(ValueError, "lowercase SHA-256"):
            evaluate_balanced_raw_batch(
                b, field(), source_deck_digests=source_decks(),
                expected_candidate_deck_sha256="not-a-digest",
                predeclared_games_per_cell=10,
            )

    def test_reused_global_seed_between_ranks_is_rejected(self):
        b = batch()
        b["games"][10]["seed"] = b["games"][0]["seed"]
        with self.assertRaisesRegex(ValueError, "Global RNG seeds"):
            assess(b, field(), predeclared_games_per_cell=10)


if __name__ == "__main__":
    unittest.main()
