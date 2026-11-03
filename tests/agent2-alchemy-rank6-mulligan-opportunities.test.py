"""Paired original-source mulligan opening regression, with strict no-bonus control."""
from __future__ import annotations
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "simulation" / "evaluation" / "agent2-alchemy-rank6-mulligan-opportunities.py"
spec = importlib.util.spec_from_file_location("agent2_mulligan", MODULE)
study = importlib.util.module_from_spec(spec)
spec.loader.exec_module(study)


class MulliganOpeningRegression(unittest.TestCase):
    def test_registered_inputs_and_source_distribution(self):
        decks, first, second = study.input_decks(ROOT)
        self.assertEqual(first.shape, (60,))
        self.assertEqual(second.shape, (60,))
        self.assertEqual(first.tolist(), sorted(first.tolist()))
        self.assertEqual(list(first).count(4), 3)
        self.assertEqual(list(second).count(4), 2)
        self.assertEqual(list(second).count(2), 4)
        self.assertEqual(decks[0]["total_cards"], 60)
        self.assertEqual(decks[1]["total_cards"], 60)
        p_candidate, p_thorns, p_offer = study.two_actor_bonus_probabilities()
        self.assertAlmostEqual(p_candidate, 0.8093533072892635, places=12)
        self.assertAlmostEqual(p_thorns, 0.3994996257446656, places=12)
        self.assertAlmostEqual(p_offer, 0.5488513367202532, places=12)

    def test_no_bonus_reduces_to_exact_opening_evaluation(self):
        result = study.simulate(ROOT, trials=8000, seed=3805, source_basic=60)
        self.assertEqual(result["completed"], 8000)
        self.assertEqual(result["censored"], 0)
        self.assertEqual(result["mulligan"]["observedBonusHistogram0Through6And7Plus"], [8000,0,0,0,0,0,0,0])
        self.assertIsNone(result["bonusAtLeastOne"])
        self.assertAlmostEqual(result["all"]["eitherLockRegidrago"]["v0"], 0.3961163033359953, delta=0.012)
        self.assertAlmostEqual(result["all"]["eitherLockRegidrago"]["v1"], 0.3551466201819768, delta=0.012)
        # Exact combinatorial first-eight no-bonus positional evidence:
        # v0 24.10999655%, v1 25.51807637%. Broad access reverses sign.
        self.assertAlmostEqual(result["all"]["positionedEitherLockRegidrago"]["v0"], 0.24109996554324095, delta=0.012)
        self.assertAlmostEqual(result["all"]["positionedEitherLockRegidrago"]["v1"], 0.2551807636708804, delta=0.012)
        for version in ("v0","v1"):
            self.assertAlmostEqual(
                result["all"]["positionedEitherLockRegidrago"][version]+
                result["all"]["unpositionedBudewOnlyRegidrago"][version],
                result["all"]["eitherLockRegidrago"][version],places=14)

    def test_four_basic_source_mulligan_race(self):
        result = study.simulate(ROOT, trials=8000, seed=3805)
        self.assertEqual(result["completed"], 8000)
        self.assertEqual(result["censored"], 0)
        self.assertIsNotNone(result["bonusAtLeastOne"])
        hist = result["mulligan"]["observedBonusHistogram0Through6And7Plus"]
        self.assertEqual(sum(hist), 8000)
        self.assertAlmostEqual(sum(hist[1:])/8000, 0.5488513367202532, delta=0.02)
        self.assertAlmostEqual(result["all"]["eitherLockRegidrago"]["difference"], -0.0410066667, delta=0.02)


if __name__ == "__main__":
    unittest.main(verbosity=2)
