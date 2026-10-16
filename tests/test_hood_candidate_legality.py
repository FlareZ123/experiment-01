"""Dated Japanese Expanded prohibited-identity audit for Hood Shield v1.

This narrow audit is not a full release-date, format or rules certificate.
"""
import json
import unittest
from pathlib import Path

from scripts.japanese_expanded_audit import audit, load_english_index

ROOT = Path(__file__).resolve().parents[1]


class HoodShieldLegalityTest(unittest.TestCase):
    def test_banned_identities_and_exclusive_supporter_pairs(self):
        candidate = json.loads(
            (ROOT / "results/aichi-2026/candidate-hood-shadow-rider.json").read_text()
        )
        banned = json.loads(
            (ROOT / "results/legality/japan-expanded-aichi-2026.json").read_text()
        )
        report = audit({"decks": [candidate]}, banned, load_english_index())
        self.assertEqual(report["decks_audited"], 1)
        self.assertEqual(report["status_rows"].get("banned", 0), 0)
        self.assertEqual(report["status_rows"].get("indeterminate-identity", 0), 0)
        self.assertEqual(report["exclusive_supporter_conflicts"], [])
        self.assertEqual(sum(row["count"] for row in candidate["cards"]), 60)


if __name__ == "__main__":
    unittest.main()
