"""Source-scoped Japanese Expanded ban audit of Temple Shadow Rider v1.

A passed result does not certify all format, errata or regional legality rules.
"""
import json
import unittest
from pathlib import Path

from scripts.japanese_expanded_audit import audit, load_english_index

ROOT = Path(__file__).resolve().parents[1]


class TempleCandidateLegalityTest(unittest.TestCase):
    def test_event_date_banned_identity_scope(self):
        candidate = json.loads(
            (ROOT / "results/aichi-2026/candidate-temple-shadow-rider.json").read_text()
        )
        banned = json.loads(
            (ROOT / "results/legality/japan-expanded-aichi-2026.json").read_text()
        )
        report = audit({"decks": [candidate]}, banned, load_english_index())
        self.assertEqual(report["decks_audited"], 1)
        self.assertEqual(report["status_rows"].get("banned", 0), 0)
        self.assertEqual(report["status_rows"].get("indeterminate-identity", 0), 0)
        self.assertEqual(report["exclusive_supporter_conflicts"], [])
        self.assertEqual(sum(c["count"] for c in candidate["cards"]), 60)


    def test_hood_shield_banned_identity_scope(self):
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
        self.assertEqual(sum(c["count"] for c in candidate["cards"]), 60)


if __name__ == "__main__":
    unittest.main()
