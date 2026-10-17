"""Synthetic trusted source fingerprint intake tests (Agent 5)."""
import hashlib
import unittest

from scripts.match_record_contract import evaluate_raw_batch


class SourceHashGateTests(unittest.TestCase):
    def test_malformed_source_map_rejected(self):
        field = "rank,player,archetype,full_list_published\n" + "".join(
            f"{rank},P{rank},Deck,{'yes' if rank == 1 else 'no'}\n"
            for rank in range(1, 33)
        )
        batch = {
            "schema_version": 2,
            "engine_slots": [{"id": 101, "name": "a"}, {"id": 202, "name": "b"}],
            "candidate_deck_sha256": "a" * 64,
            "field_manifest_sha256": hashlib.sha256(field.encode()).hexdigest(),
            "engine_revision": "engine", "research_revision": "research",
            "candidate_policy_revision": "policy", "opponent_policy_revision": "policy",
            "ruleset_revision": "paper", "rng_protocol": "seed", "games": [],
        }
        self.assertFalse(evaluate_raw_batch(batch, field)["opponent_source_inventory_bound"])
        self.assertFalse(evaluate_raw_batch(batch, field, {1: "b" * 64})["opponent_source_inventory_bound"])
        for source in ({}, {2: "b" * 64}, {1: "z" * 64}, {"1": "b" * 64}):
            with self.subTest(source=source), self.assertRaises(ValueError):
                evaluate_raw_batch(batch, field, source)


    def test_matching_and_mismatched_published_inventory(self):
        field = "rank,player,archetype,full_list_published\\n" + "".join(
            f"{rank},P{rank},Deck,{'yes' if rank == 1 else 'no'}\\n"
            for rank in range(1, 33)
        )
        batch = {
            "schema_version": 2,
            "engine_slots": [{"id": 101, "name": "a"}, {"id": 202, "name": "b"}],
            "candidate_deck_sha256": "a" * 64,
            "field_manifest_sha256": hashlib.sha256(field.encode()).hexdigest(),
            "engine_revision": "engine", "research_revision": "research",
            "candidate_policy_revision": "policy", "opponent_policy_revision": "policy",
            "ruleset_revision": "paper", "rng_protocol": "seed",
            "games": [{
                "game_id": "match-1", "rank": 1, "seat": "first", "seed": 1,
                "status": "completed", "winner_side": "A", "candidate_side": "A",
                "first_player_side": "A",
                "first_turn": {"firstTurnSlot": 0, "firstTurnPlayerId": 101,
                               "firstTurnPlayerName": "a", "firstDrawLogName": "a",
                               "verifiedByDrawLog": True},
                "opponent_deck_sha256": "b" * 64, "trace_sha256": "c" * 64,
            }],
        }
        self.assertEqual(evaluate_raw_batch(batch, field)["finished_games"], 1)
        valid = evaluate_raw_batch(batch, field, {1: "b" * 64})
        self.assertTrue(valid["opponent_source_inventory_bound"])
        self.assertFalse(valid["competitive_evidence_qualified"])
        with self.assertRaisesRegex(ValueError, "trusted ranked source"):
            evaluate_raw_batch(batch, field, {1: "c" * 64})


if __name__ == "__main__":
    unittest.main()
