"""Regression checks for exact original Rank6 discard-protection sensitivity."""

from __future__ import annotations

import runpy
import unittest
from fractions import Fraction
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / (
    "simulation/evaluation/agent18-rank6-ghala-protected-discard-sensitivity.py"
)
MODEL = runpy.run_path(str(SCRIPT))


class Rank6ProtectedPaymentTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.report = MODEL["exact_sweep"]()
        cls.by_protected = {
            row["protectedOtherCards"]: row
            for row in cls.report["allPaymentProtectCounts"]
        }

    def test_source_counts_and_protected_singleton_count(self) -> None:
        self.assertEqual(
            tuple(self.report["originalCategoryCounts"]),
            (4, 2, 2, 1, 1, 3, 47)
        )
        self.assertEqual(self.report["otherSingletonCount"], 19)
        self.assertEqual(
            self.report["exactWeightedSevenPrizeSixDrawOneStates"], 107022
        )
        self.assertEqual(self.report["exactFourCardMailSamples"], 163185)

    def test_zero_protection_exact_old_mail_and_direct_reproduction(self) -> None:
        original = self.by_protected[0]
        self.assertEqual(
            original["combined"],
            "15533827047272343835079/41010331343049635767200"
        )
        self.assertEqual(
            original["combinedWithSecondBasic"],
            "7179304406648793452273/102525828357624089418000"
        )

    def test_all_nineteen_other_singletons_protected_exact_fraction(self) -> None:
        row = self.by_protected[19]
        self.assertEqual(
            row["combined"],
            "1577689993897662481522657/4346290998219280025916000"
        )
        self.assertEqual(
            row["combinedWithSecondBasic"],
            "2372185003730719175516527/36943473484863880220286000"
        )

    def test_every_other_card_protected_boundary(self) -> None:
        row = self.by_protected[47]
        self.assertEqual(
            row["combined"], "22000728063599/885524642402400"
        )
        self.assertLess(Fraction(row["mailMarginal"]), Fraction(1, 1000))

    def test_monotonic_protection_and_no_qualified_games(self) -> None:
        self.assertEqual(self.report["competitivelyQualifiedGames"], 0)
        seen = list(self.by_protected.values())
        self.assertEqual(
            [item["protectedOtherCards"] for item in seen],
            [0, 10, 19, 25, 30, 35, 40, 45, 47]
        )
        combined = [Fraction(row["combined"]) for row in seen]
        self.assertTrue(all(a > b for a, b in zip(combined, combined[1:])))

    def test_optional_printed_gh_search_needs_no_discard_if_dce_already_held(self) -> None:
        original = self.by_protected[0]
        nineteen = self.by_protected[19]
        forty_seven = self.by_protected[47]
        self.assertEqual(
            original["optionalGhPaymentCombined"],
            "162399288709960885796971/428744373131882555748000"
        )
        self.assertEqual(
            nineteen["optionalGhPaymentCombined"],
            "392791589553272470125463/1070825318401851600588000"
        )
        self.assertEqual(
            forty_seven["optionalGhPaymentCombined"],
            "36019238122028573159941/524020900494523123692000"
        )
        for protected_row in self.by_protected.values():
            self.assertGreaterEqual(
                Fraction(protected_row["optionalGhPaymentCombined"]),
                Fraction(protected_row["combined"])
            )
        self.assertGreater(
            Fraction(nineteen["optionalGhPaymentCombined"]),
            Fraction(nineteen["combined"])
        )

    def test_hypergeometric_sanity_and_rejected_invalid_counts(self) -> None:
        gate = MODEL["payment_availability"]
        self.assertEqual(gate(19, 4, 4), 1)
        self.assertEqual(gate(19, 4, -1), 0)
        self.assertEqual(gate(0, 4, 0), 1)
        self.assertEqual(gate(47, 4, 0), 0)
        self.assertRaises(ValueError, gate, 48, 2, 1)
        self.assertRaises(ValueError, gate, -1, 2, 1)


if __name__ == "__main__":
    unittest.main()
