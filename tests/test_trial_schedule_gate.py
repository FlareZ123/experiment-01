"""External pre-registered trial schedule coverage tests (Agent 5).

The schedule is supplied by a separate trusted caller, not reconstructed
from game records. These synthetic cases do not certify real engine replay.
"""
import copy
import hashlib
import unittest

from scripts.action_trace_integrity import action_trace_sha256
from scripts.match_record_contract import evaluate_raw_batch


class TrialScheduleGateTests(unittest.TestCase):
    def setUp(self):
        self.field = "rank,player,archetype,full_list_published\\n" + "".join(
            f"{rank},P{rank},Deck,{'yes' if rank == 1 else 'no'}\\n"
            for rank in range(1, 33)
        )
        self.trace = [{"step": 0, "action": "finish"}]
        self.one = {
            "game_id": "first", "rank": 1, "seat": "first", "seed": 17,
            "candidate_side": "A", "status": "completed", "winner_side": "A",
            "first_player_side": "A",
            "first_turn": {
                "firstTurnSlot": 0, "firstTurnPlayerId": 101,
                "firstTurnPlayerName": "a", "firstDrawLogName": "a",
                "verifiedByDrawLog": True
            },
            "opponent_deck_sha256": "b" * 64,
            "trace_sha256": action_trace_sha256(self.trace),
            "action_trace": self.trace,
            "engine_terminal": {"finished": True, "winnerIndex": 0},
        }
        self.batch = {
            "schema_version": 2,
            "engine_slots": [{"id": 101, "name": "a"}, {"id": 202, "name": "b"}],
            "candidate_deck_sha256": "a" * 64,
            "field_manifest_sha256": hashlib.sha256(self.field.encode()).hexdigest(),
            "engine_revision": "engine", "research_revision": "research",
            "candidate_policy_revision": "fixed-policy",
            "opponent_policy_revision": "fixed-opponent",
            "ruleset_revision": "paper", "rng_protocol": "seed",
            "games": [copy.deepcopy(self.one)]
        }
        self.trial = {
            "game_id": "first", "rank": 1, "seed": 17, "candidate_side": "A"
        }

    def evaluate(self, schedule=None):
        return evaluate_raw_batch(
            self.batch, self.field, {1: "b" * 64}, candidate_hash="a" * 64,
            expected_trials=schedule
        )

    def test_external_schedule_is_required_for_sampling_frame_gate(self):
        unbound = self.evaluate()
        self.assertTrue(unbound["full_input_integrity_promotion_eligible"])
        self.assertFalse(unbound["schedule_bound"])
        self.assertFalse(unbound["all_scheduled_trials_accounted"])
        self.assertFalse(unbound["sampling_frame_input_integrity_promotion_eligible"])
        accepted = self.evaluate([self.trial])
        self.assertTrue(accepted["schedule_bound"])
        self.assertEqual(accepted["scheduled_trial_count"], 1)
        self.assertTrue(accepted["all_scheduled_trials_accounted"])
        self.assertTrue(accepted["sampling_frame_input_integrity_promotion_eligible"])
        self.assertFalse(accepted["competitive_evidence_qualified"])

    def test_omitted_or_unscheduled_games_fail_closed(self):
        second = {"game_id": "second", "rank": 1, "seed": 18,
                  "candidate_side": "B"}
        with self.assertRaisesRegex(ValueError, "omitted"):
            self.evaluate([self.trial, second])
        extra = copy.deepcopy(self.one)
        extra.update(game_id="second", seed=18)
        self.batch["games"].append(extra)
        with self.assertRaisesRegex(ValueError, "Unscheduled"):
            self.evaluate([self.trial])

    def test_schedule_fields_bind_to_actual_trial_record(self):
        for field, changed in (
            ("game_id", "different"), ("rank", 2), ("seed", 18),
            ("candidate_side", "B")
        ):
            schedule = dict(self.trial)
            schedule[field] = changed
            with self.subTest(field=field), self.assertRaises(ValueError):
                self.evaluate([schedule])

    def test_malformed_schedules_fail_closed(self):
        cases = [[], {}, [self.trial, self.trial],
                 [{**self.trial, "seed": True}],
                 [{**self.trial, "rank": True}],
                 [{**self.trial, "candidate_side": "C"}],
                 [{**self.trial, "game_id": ""}]]
        for schedule in cases:
            with self.subTest(schedule=schedule), self.assertRaises(ValueError):
                self.evaluate(schedule)

    def test_scheduled_failure_is_reported_and_disqualifies_promotion(self):
        failure = copy.deepcopy(self.one)
        failure.update(
            game_id="second", seed=18, seat="unverified",
            candidate_side="B", status="timeout", winner_side=None,
            first_turn=None, first_player_side=None,
            engine_terminal={"finished": False, "winnerIndex": -1}
        )
        self.batch["games"].append(failure)
        schedule = [self.trial, {"game_id": "second", "rank": 1,
                                 "seed": 18, "candidate_side": "B"}]
        result = self.evaluate(schedule)
        self.assertTrue(result["all_scheduled_trials_accounted"])
        self.assertEqual(len(result["failures"]), 1)
        self.assertEqual(result["pre_first_turn_failures"], 1)
        self.assertFalse(result["sampling_frame_input_integrity_promotion_eligible"])


if __name__ == "__main__":
    unittest.main()
