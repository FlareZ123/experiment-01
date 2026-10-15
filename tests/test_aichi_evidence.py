"""Synthetic evidence tests for the Aichi field."""
import unittest
from scripts.aichi_evidence import MatchupCounts, RunProvenance, evaluate, flawless_games_per_placement

PROVENANCE = RunProvenance("a" * 64, "engine", "policy", "field", "seed protocol")

def field(missing=(23, 25, 28)):
    return "rank,player,archetype,full_list_published\n" + "".join(
        f"{i},P{i},Deck,{'no' if i in missing else 'yes'}\n" for i in range(1, 33))

def trials(ranks, n):
    return tuple(MatchupCounts(i, n, 0, 0, "b" * 64) for i in ranks)

class AichiTests(unittest.TestCase):
    def test_unpublished_prevents_claim(self):
        known = [i for i in range(1, 33) if i not in (23, 25, 28)]
        result = evaluate(field(), trials(known, 10000), PROVENANCE)
        self.assertLess(result.simultaneous_field_lower, 29 / 32)
        self.assertFalse(result.target_995_demonstrated)

    def test_995_threshold(self):
        n = flawless_games_per_placement()
        self.assertEqual(n, 1428)
        self.assertTrue(evaluate(field(()), trials(range(1, 33), n), PROVENANCE).target_995_demonstrated)
        self.assertFalse(evaluate(field(()), trials(range(1, 33), n - 1), PROVENANCE).target_995_demonstrated)

    def test_draws_and_gaps(self):
        observed = evaluate(field(), (MatchupCounts(1, 5, 2, 3, "b" * 64),), PROVENANCE)
        self.assertEqual(observed.matchups[0].observed_win_fraction, 0.5)
        self.assertEqual(observed.matchups[22].status, "unpublished")
        with self.assertRaises(ValueError):
            evaluate(field(), trials([23], 10), PROVENANCE)

if __name__ == "__main__":
    unittest.main()
