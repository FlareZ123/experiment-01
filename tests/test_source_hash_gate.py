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


if __name__ == "__main__":
    unittest.main()
