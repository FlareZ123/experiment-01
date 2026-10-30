"""Pure table-shape and owner-information boundary checks for the rank11 archive audit."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from agent32_rank11_k0_archive_audit import analyze


def row(index, starter=None, hand=None, source_first=True, verified=True):
    return {
        "index": index, "seed": index + 100,
        "sourceFirst": source_first, "drawVerified": verified,
        "sourceStarter": starter, "sourceOwnHandPrintings": hand,
        "eligibleK0": False
    }


class ArchivedRank11OwnerHandAuditTests(unittest.TestCase):
    def test_source_first_hand_only_potential_and_no_claim_of_bench(self):
        cases = [
            row(0, "Oranguru V", ["Boost Shake EVS", "Darkness Energy MEE"]),
            row(1, "Oranguru V", ["Boost Shake EVS", "Trubbish FST"]),
            row(2, "Mega Absol ex", ["Boost Shake EVS"]),
            row(3, source_first=False)
        ]
        result = analyze(cases)
        self.assertEqual(result["allAttempts"], 4)
        self.assertEqual(result["verifiedActualSourceFirst"], 3)
        self.assertEqual(result["sourceFirstOranguruActive"], 2)
        self.assertEqual(result["sourceFirstOranguruWithHeldShake"], 2)
        self.assertEqual(
            result["sourceFirstOranguruHeldShakeNeitherHandTrubbishNorVIP"], 1)
        self.assertEqual(result["cases"][0]["index"], 0)
        self.assertFalse(result["cases"][0]["initialBenchKnown"])
        self.assertEqual(result["competitiveQualifiedGames"], 0)

    def test_reject_duplicate_or_missing_index(self):
        with self.assertRaises(ValueError):
            analyze([row(0), row(0)])
        with self.assertRaises(ValueError):
            analyze([row(0), row(2)])

    def test_reject_unverified_source_first(self):
        with self.assertRaises(ValueError):
            analyze([row(0, "Oranguru V", ["Boost Shake EVS"], verified=False)])

    def test_reject_missing_own_hand(self):
        with self.assertRaises(ValueError):
            analyze([row(0, "Oranguru V", None)])


if __name__ == "__main__":
    unittest.main()
