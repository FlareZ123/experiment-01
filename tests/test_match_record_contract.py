"""Synthetic contract tests for raw Aichi match records."""
import copy
import hashlib
import unittest

from scripts.match_record_contract import evaluate_raw_batch


def field():
    return "rank,player,archetype,full_list_published\n" + "".join(
        f"{i},P{i},Deck,{'yes' if i <= 2 else 'no'}\n" for i in range(1, 33)
    )


def batch():
    return {
        "schema_version": 1,
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
    return {
        "game_id": identifier, "rank": rank, "seat": seat, "seed": seed,
        "status": status, "winner_side": winner, "candidate_side": side,
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


if __name__ == "__main__":
    unittest.main()
