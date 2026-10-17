"""Synthetic contract tests for raw Aichi match records."""
import copy
import hashlib
from scripts.action_trace_integrity import action_trace_sha256
import unittest

from scripts.match_record_contract import evaluate_raw_batch


def field():
    return "rank,player,archetype,full_list_published\n" + "".join(
        f"{i},P{i},Deck,{'yes' if i <= 2 else 'no'}\n" for i in range(1, 33)
    )


def batch():
    return {
        "schema_version": 2,
        "engine_slots": [{"id": 101, "name": "research-A"},
                         {"id": 202, "name": "research-B"}],
        "candidate_deck_sha256": "a" * 64,
        "field_manifest_sha256": hashlib.sha256(field().encode()).hexdigest(),
        "engine_revision": "engine",
        "research_revision": "research",
        "candidate_policy_revision": "candidate-bot",
        "opponent_policy_revision": "opponent-bot",
        "ruleset_revision": "rules",
        "rng_protocol": "seeded",
        "games": [],
    }


def game(identifier, rank, seat, seed, status, winner, side="A"):
    first_side = side if seat == "first" else ("B" if side == "A" else "A")
    name = "research-" + first_side
    return {
        "game_id": identifier, "rank": rank, "seat": seat, "seed": seed,
        "status": status, "winner_side": winner, "candidate_side": side,
        "first_player_side": first_side,
        "first_turn": {
            "firstTurnSlot": 0 if first_side == "A" else 1,
            "firstTurnPlayerId": 101 if first_side == "A" else 202,
            "firstTurnPlayerName": name,
            "firstDrawLogName": name,
            "verifiedByDrawLog": True,
        },
        "opponent_deck_sha256": "b" * 64, "trace_sha256": "c" * 64,
    }


class RawContractTests(unittest.TestCase):
    def test_tie_and_engine_failure_are_never_wins(self):
        data = batch()
        data["games"] = [
            game("win", 1, "first", 1, "completed", "A"),
            game("tie", 1, "second", 2, "completed", None),
            game("bad", 2, "first", 3, "policy_stall", None),
        ]
        result = evaluate_raw_batch(data, field())
        self.assertEqual(result["finished_games"], 2)
        self.assertEqual(result["finished_ties_as_nonwins"], 1)
        self.assertEqual(len(result["failures"]), 1)
        self.assertFalse(result["arithmetic_threshold_with_no_failures"])
        self.assertFalse(result["statistical_result"]["complete"])

    def test_rejects_false_wins_and_unpublished_ranks(self):
        data = batch()
        data["games"] = [game("bad", 1, "first", 1, "timeout", "A")]
        with self.assertRaises(ValueError):
            evaluate_raw_batch(data, field())
        data["games"] = [game("unknown", 23, "first", 2, "completed", "A")]
        with self.assertRaises(ValueError):
            evaluate_raw_batch(data, field())

    def test_rejects_duplicate_seeds_and_wrong_manifest(self):
        data = batch()
        data["games"] = [
            game("one", 1, "first", 1, "completed", "A"),
            game("two", 1, "first", 1, "completed", "B"),
        ]
        with self.assertRaises(ValueError):
            evaluate_raw_batch(data, field())
        data = batch()
        data["field_manifest_sha256"] = "d" * 64
        with self.assertRaises(ValueError):
            evaluate_raw_batch(data, field())

    def test_pre_first_turn_failure_preserves_unknown_seat(self):
        data = batch()
        failed = game("bad-before-start", 1, "first", 81,
                      "invalid_deck", None)
        failed["seat"] = "unverified"
        failed["first_player_side"] = None
        failed["first_turn"] = None
        data["games"] = [failed]
        result = evaluate_raw_batch(data, field())
        self.assertEqual(result["finished_games"], 0)
        self.assertEqual(result["pre_first_turn_failures"], 1)
        self.assertEqual(result["failures"][0]["seat"], "unverified")
        self.assertFalse(result["failures"][0]["first_turn_verified"])
        self.assertFalse(result["arithmetic_threshold_with_no_failures"])

        for edit in (
            lambda g: g.__setitem__("seat", "first"),
            lambda g: g.__setitem__("first_player_side", "A"),
            lambda g: g.__setitem__("status", "completed"),
            lambda g: g.__setitem__("winner_side", "A"),
            lambda g: g.__setitem__("first_turn", {}),
        ):
            attempt = copy.deepcopy(failed)
            edit(attempt)
            with self.subTest(edit=edit), self.assertRaises(ValueError):
                evaluate_raw_batch({**data, "games": [attempt]}, field())

    def test_verified_failure_keeps_first_turn_attribution(self):
        data = batch()
        data["games"] = [game("late-stall", 2, "second", 82,
                              "policy_stall", None)]
        result = evaluate_raw_batch(data, field())
        self.assertEqual(result["pre_first_turn_failures"], 0)
        self.assertEqual(result["failures"][0]["seat"], "second")
        self.assertTrue(result["failures"][0]["first_turn_verified"])

    def test_first_player_proof_is_required(self):
        template = game("bad-order", 1, "second", 8, "completed", "A")
        edits = [
            lambda g: g.__setitem__("first_player_side", "A"),
            lambda g: g.__setitem__("seat", "first"),
            lambda g: g["first_turn"].__setitem__("firstTurnSlot", 0),
            lambda g: g["first_turn"].__setitem__("firstDrawLogName", "research-A"),
            lambda g: g["first_turn"].__setitem__("firstTurnPlayerId", 101),
            lambda g: g["first_turn"].__setitem__("firstTurnPlayerName", "research-A"),
            lambda g: g["first_turn"].__setitem__("verifiedByDrawLog", False),
        ]
        for edit in edits:
            attempt = copy.deepcopy(template)
            edit(attempt)
            data = batch()
            data["games"] = [attempt]
            with self.subTest(edit=edit), self.assertRaises(ValueError):
                evaluate_raw_batch(data, field())


    def test_digest_only_stays_diagnostic_and_verified_trace_only_checks_integrity(self):
        data = batch()
        completed = game("verified", 1, "first", 501, "completed", "A")
        data["games"] = [completed]
        plain = evaluate_raw_batch(data, field())
        self.assertEqual(plain["digest_only_completed_games"], 1)
        self.assertFalse(plain["all_completed_traces_verified"])
        self.assertFalse(plain["trace_integrity_promotion_eligible"])

        completed["action_trace"] = [{"step": 0, "action": "draw", "count": 1}]
        completed["trace_sha256"] = action_trace_sha256(completed["action_trace"])
        verified = evaluate_raw_batch(data, field())
        self.assertEqual(verified["verified_completed_traces"], 1)
        self.assertEqual(verified["digest_only_completed_games"], 0)
        self.assertTrue(verified["all_completed_traces_verified"])
        self.assertTrue(verified["trace_integrity_promotion_eligible"])
        self.assertFalse(verified["competitive_evidence_qualified"])
        data["games"].append(game("unverified", 2, "second", 502, "completed", "B"))
        mixed = evaluate_raw_batch(data, field())
        self.assertFalse(mixed["all_completed_traces_verified"])
        self.assertFalse(mixed["trace_integrity_promotion_eligible"])

    def test_tampering_with_action_or_digest_is_rejected(self):
        completed = game("verified", 1, "first", 503, "completed", "A")
        completed["action_trace"] = [{"step": 0, "action": "attach", "card": "Energy"}]
        completed["trace_sha256"] = action_trace_sha256(completed["action_trace"])
        changed = copy.deepcopy(completed)
        changed["action_trace"][0]["card"] = "Secret Box"
        for candidate in [changed, {**completed, "trace_sha256": "c" * 64}]:
            with self.assertRaisesRegex(ValueError, "match"):
                evaluate_raw_batch({**batch(), "games": [candidate]}, field())


    def test_engine_terminals_bind_both_physical_seats_and_ties(self):
        data = batch()
        a = game("a-win", 1, "first", 601, "completed", "A", side="A")
        b = game("b-win", 1, "first", 602, "completed", "B", side="B")
        tie = game("tie", 2, "second", 603, "completed", None, side="B")
        for record, index in ((a, 0), (b, 1), (tie, 3)):
            record["engine_terminal"] = {"finished": True, "winnerIndex": index}
            record["action_trace"] = [{"step": 0, "action": "finish"}]
            record["trace_sha256"] = action_trace_sha256(record["action_trace"])
        data["games"] = [a, b, tie]
        result = evaluate_raw_batch(data, field())
        self.assertEqual(result["terminal_bound_games"], 3)
        self.assertEqual(result["unbound_completed_games"], 0)
        self.assertTrue(result["all_completed_terminals_bound"])
        self.assertTrue(result["outcome_integrity_promotion_eligible"])
        self.assertEqual(result["finished_ties_as_nonwins"], 1)
        self.assertEqual(result["statistical_result"],
                         result["terminal_bound_statistical_result"])
        self.assertFalse(result["competitive_evidence_qualified"])

    def test_engine_terminal_mismatch_and_malformed_values_fail_closed(self):
        examples = [
            ({"finished": True, "winnerIndex": 1}, "contradicts"),
            ({"finished": True, "winnerIndex": 3}, "contradicts"),
            ({"finished": False, "winnerIndex": 0}, "Invalid completed"),
            ({"finished": 1, "winnerIndex": 0}, "Invalid completed"),
            ({"finished": True, "winnerIndex": False}, "Invalid completed"),
            ({"finished": True, "winnerIndex": 2}, "Invalid completed"),
            ({"finished": True, "winnerIndex": -1}, "Invalid completed"),
            ({"finished": True}, "Invalid completed"),
            (None, "must be an object"),
        ]
        for terminal, message in examples:
            record = game("bad-terminal", 1, "first", 604, "completed", "A")
            record["engine_terminal"] = terminal
            with self.subTest(terminal=terminal), self.assertRaisesRegex(ValueError, message):
                evaluate_raw_batch({**batch(), "games": [record]}, field())

    def test_legacy_unbound_winners_do_not_receive_terminal_promotion(self):
        data = batch()
        bound = game("bound", 1, "first", 605, "completed", "A")
        bound["engine_terminal"] = {"finished": True, "winnerIndex": 0}
        legacy = game("legacy", 2, "first", 606, "completed", "A")
        for record in (bound, legacy):
            record["action_trace"] = [{"step": 0, "action": "finish"}]
            record["trace_sha256"] = action_trace_sha256(record["action_trace"])
        data["games"] = [bound, legacy]
        result = evaluate_raw_batch(data, field())
        self.assertEqual(result["terminal_bound_games"], 1)
        self.assertEqual(result["unbound_completed_games"], 1)
        self.assertTrue(result["trace_integrity_promotion_eligible"])
        self.assertFalse(result["outcome_integrity_promotion_eligible"])
        self.assertFalse(result["all_completed_terminals_bound"])
        self.assertFalse(result["terminal_bound_statistical_result"]["complete"])

    def test_failed_game_cannot_claim_terminal_winner(self):
        data = batch()
        failed = game("failed", 1, "second", 607, "engine_exception", None)
        for terminal in (
            {"finished": True, "winnerIndex": 0},
            {"finished": False, "winnerIndex": 3},
            {"finished": False, "winnerIndex": None},
            {"finished": False, "winnerIndex": False},
        ):
            failed["engine_terminal"] = terminal
            with self.subTest(terminal=terminal), self.assertRaisesRegex(ValueError, "Failed game"):
                evaluate_raw_batch({**data, "games": [failed]}, field())
        failed["engine_terminal"] = {"finished": False, "winnerIndex": -1}
        result = evaluate_raw_batch({**data, "games": [failed]}, field())
        self.assertEqual(result["finished_games"], 0)
        self.assertFalse(result["all_completed_terminals_bound"])


if __name__ == "__main__":
    unittest.main()
