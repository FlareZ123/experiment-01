"""End-to-end synthetic raw-game controls for the balanced 32-by-two evidence gate."""
import hashlib
import unittest

from scripts.action_trace_integrity import action_trace_sha256
from scripts.aichi_raw_global_gate import (
    evaluate_balanced_raw_batch, evaluate_natural_start_zero_loss_raw_batch,
    source_inventory_digest,
)



def source_decks():
    return {
        rank: hashlib.sha256(f"rank-{rank}".encode()).hexdigest()
        for rank in range(1, 33)
    }


def registered_schedule(horizon=10):
    return [
        {
            "game_id": f"{rank}-{seat}-{trial}",
            "rank": rank,
            "seed": rank * 10000 + (0 if seat == "first" else 5000) + trial + 1,
            "candidate_side": "A",
        }
        for rank in range(1, 33)
        for seat in ("first", "second")
        for trial in range(horizon)
    ]


def assess(source_batch, manifest, *, predeclared_games_per_cell):
    return evaluate_balanced_raw_batch(
        source_batch, manifest, source_deck_digests=source_decks(),
        expected_candidate_deck_sha256="a" * 64,
        predeclared_games_per_cell=predeclared_games_per_cell,
        expected_trials=registered_schedule(predeclared_games_per_cell),
    )


def field(missing_rank=None):
    return "rank,player,archetype,full_list_published\n" + "".join(
        f"{rank},Player {rank},Deck,{'no' if rank == missing_rank else 'yes'}\n"
        for rank in range(1, 33)
    )


def game(rank, seat, trial, *, status="completed", winner="A"):
    first_side = "A" if seat == "first" else "B"
    trace_id = f"{rank}-{seat}-{trial}"
    action_trace = [{"step": 0, "action": "synthetic-completed-game", "game_id": trace_id}]
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
        "trace_sha256": action_trace_sha256(action_trace),
        "action_trace": action_trace,
        "engine_terminal": {
            "finished": status == "completed",
            "winnerIndex": (
                0 if winner == "A" else 1 if winner == "B" else 3
            ) if status == "completed" else -1,
        },
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



def relocate_candidate_to_engine_side(g, side):
    """Synthetic setup mutation with consistent actual first draw and terminal."""
    g["candidate_side"] = side
    g["winner_side"] = side
    g["engine_terminal"]["winnerIndex"] = 0 if side == "A" else 1
    first_side = side if g["seat"] == "first" else ("A" if side == "B" else "B")
    g["first_player_side"] = first_side
    g["first_turn"]["firstTurnSlot"] = 0 if first_side == "A" else 1
    g["first_turn"]["firstTurnPlayerId"] = 101 if first_side == "A" else 202
    g["first_turn"]["firstTurnPlayerName"] = f"research-{first_side}"
    g["first_turn"]["firstDrawLogName"] = f"research-{first_side}"


def four_cell_schedule(horizon=5):
    """External synthetic preregistration, independent of observed batch rows."""
    return [
        {**entry, "candidate_side": "A" if int(entry["game_id"].rsplit("-", 1)[1]) < horizon else "B"}
        for entry in registered_schedule(horizon * 2)
    ]


def four_cell_batch(horizon=5):
    b = batch(horizon * 2)
    b["predeclared_games_per_cell"] = horizon
    for g in b["games"]:
        if int(g["game_id"].rsplit("-", 1)[1]) >= horizon:
            relocate_candidate_to_engine_side(g, "B")
    return b


def assess_four_cell(b, *, horizon=5, schedule=None):
    return evaluate_balanced_raw_batch(
        b, field(), source_deck_digests=source_decks(),
        expected_candidate_deck_sha256="a" * 64,
        predeclared_games_per_cell=horizon,
        expected_trials=four_cell_schedule(horizon) if schedule is None else schedule,
        require_physical_seat_balance=True,
    )


def natural_start_assessment(b, schedule):
    return evaluate_natural_start_zero_loss_raw_batch(
        b, field(), source_deck_digests=source_decks(),
        expected_candidate_deck_sha256="a" * 64,
        predeclared_total_games=640,
        expected_trials=schedule,
    )


def set_actual_start(g, seat):
    """Change only synthetic exogenous starter proof, never opponent/candidate inventory."""
    g["seat"] = seat
    first_side = g["candidate_side"] if seat == "first" else (
        "A" if g["candidate_side"] == "B" else "B"
    )
    g["first_player_side"] = first_side
    g["first_turn"]["firstTurnSlot"] = 0 if first_side == "A" else 1
    g["first_turn"]["firstTurnPlayerId"] = 101 if first_side == "A" else 202
    g["first_turn"]["firstTurnPlayerName"] = f"research-{first_side}"
    g["first_turn"]["firstDrawLogName"] = f"research-{first_side}"

class BalancedRawGateTests(unittest.TestCase):
    def test_complete_640_synthetic_wins_pass_math_gate(self):
        x = assess(batch(), field(),
                                        predeclared_games_per_cell=10)
        self.assertTrue(x["global_test"]["statistical_threshold_met"])
        self.assertEqual(x["raw_games"], 640)
        self.assertEqual(x["completed_ties_as_nonwins"], 0)
        self.assertTrue(x["all_completed_traces_verified"])
        self.assertFalse(x["competitive_evidence_qualified"])
        self.assertTrue(x["all_completed_terminals_bound"])
        self.assertTrue(x["schedule_bound"])
        self.assertEqual(x["scheduled_trial_count"], 640)

    def test_digest_only_record_is_rejected(self):
        b = batch()
        del b["games"][0]["action_trace"]
        with self.assertRaisesRegex(ValueError, "verified action traces"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_tampered_action_is_rejected(self):
        b = batch()
        b["games"][0]["action_trace"][0]["action"] = "tampered"
        with self.assertRaisesRegex(ValueError, "does not match"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_one_tie_counts_as_nonwin(self):
        b = batch()
        b["games"][0]["winner_side"] = None
        b["games"][0]["engine_terminal"]["winnerIndex"] = 3
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
        with self.assertRaisesRegex(ValueError, "Scheduled trial results omitted"):
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
        with self.assertRaisesRegex(ValueError, "Unscheduled trial"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_failure_blocks_even_with_remaining_valid_games(self):
        b = batch()
        b["games"][0]["winner_side"] = None
        b["games"][0]["status"] = "policy_stall"
        b["games"][0]["engine_terminal"] = {"finished": False, "winnerIndex": -1}
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
        with self.assertRaisesRegex(ValueError, "Opponent hash disagrees"):
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
                expected_trials=registered_schedule(10),
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
                expected_trials=registered_schedule(10),
            )

    def test_reused_global_seed_between_ranks_is_rejected(self):
        b = batch()
        b["games"][10]["seed"] = b["games"][0]["seed"]
        with self.assertRaisesRegex(ValueError, "Global RNG seeds"):
            assess(b, field(), predeclared_games_per_cell=10)


    def test_missing_engine_terminal_blocks_arithmetic_promotion(self):
        b = batch()
        del b["games"][0]["engine_terminal"]
        with self.assertRaisesRegex(ValueError, "engine-terminal-bound winners"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_mismatched_engine_terminal_winner_blocks(self):
        b = batch()
        b["games"][0]["engine_terminal"]["winnerIndex"] = 1
        with self.assertRaisesRegex(ValueError, "contradicts engine terminal"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_independent_schedule_is_required(self):
        b = batch()
        with self.assertRaisesRegex(ValueError, "Independent predeclared trial schedule"):
            evaluate_balanced_raw_batch(
                b, field(), source_deck_digests=source_decks(),
                expected_candidate_deck_sha256="a" * 64,
                predeclared_games_per_cell=10, expected_trials=[],
            )

    def test_unique_but_unscheduled_seed_blocks(self):
        b = batch()
        b["games"][0]["seed"] += 1000000
        with self.assertRaisesRegex(ValueError, "Unscheduled trial"):
            assess(b, field(), predeclared_games_per_cell=10)

    def test_mismatched_scheduled_candidate_side_blocks(self):
        b = batch()
        b["games"][0]["candidate_side"] = "B"
        with self.assertRaisesRegex(ValueError, "Unscheduled trial"):
            assess(b, field(), predeclared_games_per_cell=10)



    def test_strict_128_cell_physical_seat_balance_passes_640_synthetic_wins(self):
        outcome = assess_four_cell(four_cell_batch())
        self.assertEqual(outcome["raw_games"], 640)
        self.assertTrue(outcome["physical_seat_balance_required"])
        self.assertEqual(len(outcome["physical_seat_cells"]), 128)
        self.assertEqual({c["games"] for c in outcome["physical_seat_cells"]}, {5})
        self.assertEqual(outcome["global_test"]["games_per_cell"], 10)
        self.assertTrue(outcome["global_test"]["statistical_threshold_met"])
        self.assertFalse(outcome["competitive_evidence_qualified"])

    def test_strict_gate_rejects_one_engine_seat_even_when_64_cells_pass(self):
        all_a = batch()
        self.assertTrue(assess(all_a, field(), predeclared_games_per_cell=10)["global_test"]["statistical_threshold_met"])
        all_a["predeclared_games_per_cell"] = 5
        with self.assertRaisesRegex(ValueError, "128 rank/start/physical-seat cells"):
            assess_four_cell(all_a, schedule=registered_schedule(10))

    def test_strict_gate_rejects_predeclared_but_unbalanced_physical_seats(self):
        b = four_cell_batch()
        relocate_candidate_to_engine_side(b["games"][0], "B")
        schedule = four_cell_schedule()
        schedule[0]["candidate_side"] = "B"
        with self.assertRaisesRegex(ValueError, "128 rank/start/physical-seat cells"):
            assess_four_cell(b, schedule=schedule)

    def test_strict_gate_rejects_wrong_actual_starter_on_engine_seat_b(self):
        b = four_cell_batch()
        g = next(g for g in b["games"] if g["candidate_side"] == "B")
        g["first_player_side"] = "A" if g["first_player_side"] == "B" else "B"
        with self.assertRaisesRegex(ValueError, "Declared first-player side"):
            assess_four_cell(b)


    def test_natural_starters_all_a_legacy_64_significant_128_inconclusive(self):
        b = batch()
        b["predeclared_total_games"] = 640
        result = natural_start_assessment(b, registered_schedule())
        self.assertTrue(result["equal_64_rank_start"]["statistical_threshold_met"])
        self.assertEqual(
            result["equal_128_rank_start_physical_seat"]["unobserved_cells"], 64
        )
        self.assertEqual(
            result["equal_128_rank_start_physical_seat"]["sharp_all_win_null_probability"], 1.0
        )
        self.assertFalse(result["competitive_evidence_qualified"])

    def test_natural_starters_balanced_128_both_targets_pass_synthetic(self):
        b = four_cell_batch()
        b["predeclared_total_games"] = 640
        result = natural_start_assessment(b, four_cell_schedule())
        self.assertTrue(result["equal_64_rank_start"]["statistical_threshold_met"])
        self.assertTrue(result["equal_128_rank_start_physical_seat"]["statistical_threshold_met"])
        self.assertEqual(result["raw_games"], 640)

    def test_natural_starters_crossed_seat_interactions_change_null(self):
        b = four_cell_batch()
        b["predeclared_total_games"] = 640
        for rank in range(1, 33):
            a_second = [g for g in b["games"] if g["rank"] == rank
                        and g["candidate_side"] == "A" and g["seat"] == "second"]
            b_first = [g for g in b["games"] if g["rank"] == rank
                       and g["candidate_side"] == "B" and g["seat"] == "first"]
            for g in a_second[:3]:
                set_actual_start(g, "first")
            for g in b_first[:3]:
                set_actual_start(g, "second")
        result = natural_start_assessment(b, four_cell_schedule())
        self.assertTrue(result["equal_64_rank_start"]["statistical_threshold_met"])
        physical = result["equal_128_rank_start_physical_seat"]
        self.assertAlmostEqual(
            physical["sharp_all_win_null_probability"], 0.99 ** 128, places=12
        )
        self.assertFalse(physical["statistical_threshold_met"])
        self.assertEqual(physical["unobserved_cells"], 0)

    def test_natural_starters_one_nonwin_cannot_use_zero_loss_bound(self):
        b = four_cell_batch()
        b["predeclared_total_games"] = 640
        b["games"][0]["winner_side"] = None
        b["games"][0]["engine_terminal"]["winnerIndex"] = 3
        result = natural_start_assessment(b, four_cell_schedule())
        self.assertFalse(result["equal_64_rank_start"]["all_win_test_applicable"])
        self.assertFalse(result["equal_128_rank_start_physical_seat"]["statistical_threshold_met"])
        self.assertIsNone(
            result["equal_128_rank_start_physical_seat"]["sharp_all_win_null_probability"]
        )

    def test_natural_starters_registered_total_and_sources_still_required(self):
        b = four_cell_batch()
        b["predeclared_total_games"] = 641
        with self.assertRaisesRegex(ValueError, "registered total trial count"):
            natural_start_assessment(b, four_cell_schedule())
        b["predeclared_total_games"] = 640
        b["source_inventory_digest_sha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "source inventory"):
            natural_start_assessment(b, four_cell_schedule())

if __name__ == "__main__":
    unittest.main()
