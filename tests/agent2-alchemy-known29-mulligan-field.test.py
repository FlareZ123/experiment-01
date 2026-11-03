"""Smoke test for authenticated-29 source strata and paired weighted probabilities."""
from __future__ import annotations
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODE = ROOT / "simulation" / "evaluation" / "agent2-alchemy-known29-mulligan-field.py"
spec = importlib.util.spec_from_file_location("agent2_field", CODE)
field = importlib.util.module_from_spec(spec)
spec.loader.exec_module(field)


class Known29FieldRegression(unittest.TestCase):
    def test_stage_audited_rank_strata(self):
        counts = field.source_strata(ROOT)
        expected = {14:6, 11:6, 13:3, 4:3, 12:3, 10:1, 15:4, 16:3}
        self.assertEqual(dict(counts), expected)
        self.assertEqual(sum(counts.values()), 29)

    def test_paired_weighted_field_conservation(self):
        report = field.run(ROOT, trials_per_stratum=250, seed=3701)
        self.assertEqual(report["totalTrials"], 2000)
        self.assertEqual(sum(row["sourceRankCount"] for row in report["strata"]), 29)
        for metric in field.METRICS:
            observed = report["equalRankField"][metric]
            expected_v0 = sum(row["sourceRankCount"]/29 * row["metrics"][metric]["v0"]
                              for row in report["strata"])
            expected_v1 = sum(row["sourceRankCount"]/29 * row["metrics"][metric]["v1"]
                              for row in report["strata"])
            self.assertAlmostEqual(observed["v0"], expected_v0, places=12)
            self.assertAlmostEqual(observed["v1"], expected_v1, places=12)
            self.assertAlmostEqual(observed["delta"], observed["v1"]-observed["v0"], places=12)
            self.assertLessEqual(observed["paired95CI"][0], observed["delta"])
            self.assertGreaterEqual(observed["paired95CI"][1], observed["delta"])
        self.assertAlmostEqual(report["strata"][0]["bonusOfferProbability"],
                               0.5488513367202532, places=12)


if __name__ == "__main__":
    unittest.main(verbosity=2)
