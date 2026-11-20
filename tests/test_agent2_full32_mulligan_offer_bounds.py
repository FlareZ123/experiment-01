import importlib.util
from pathlib import Path
import unittest
from fractions import Fraction

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "agent2-full32-mulligan-offer-bounds.py"
SPEC = importlib.util.spec_from_file_location("agent2_full32_mulligan_bounds", SCRIPT)
MODEL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODEL)


class Full32MulliganOfferBoundsTests(unittest.TestCase):
    def test_known_source_vector_is_exactly_29_of_32(self):
        self.assertEqual(set(MODEL.BASICS_BY_RANK),
                         set(range(1, 33)) - set(MODEL.MISSING_RANKS))
        self.assertEqual(len(MODEL.BASICS_BY_RANK), 29)
        self.assertEqual(sum(MODEL.BASICS_BY_RANK.values()), 355)

    def test_joint_reset_categories_partition_probability(self):
        result = MODEL.paired_bonus_stats(5, 14)
        self.assertEqual(
            result["opponent_opportunity"] +
            result["candidate_opportunity"] +
            result["neither"],
            Fraction(1, 1),
        )

    def test_equal_basic_counts_are_symmetric(self):
        result = MODEL.paired_bonus_stats(14, 14)
        self.assertEqual(result["opponent_opportunity"],
                         result["candidate_opportunity"])
        self.assertEqual(result["opponent_max_offers"],
                         result["candidate_max_offers"])
        self.assertEqual(result["difference"], Fraction(0, 1))

    def test_five_vs_fourteen_exact_values(self):
        result = MODEL.paired_bonus_stats(5, 14)
        self.assertAlmostEqual(float(result["opponent_opportunity"]),
                               0.4881656474858669, places=14)
        self.assertAlmostEqual(float(result["candidate_opportunity"]),
                               0.0709354714082445, places=14)
        self.assertAlmostEqual(float(result["neither"]),
                               0.4408988811058886, places=14)
        self.assertAlmostEqual(float(result["opponent_max_offers"]),
                               1.0286653166788646, places=14)
        self.assertAlmostEqual(float(result["candidate_max_offers"]),
                               0.08234815880561033, places=14)

    def test_extrema_over_all_possible_missing_basic_counts(self):
        report = MODEL.build_report()
        five = report["candidates"]["5"]
        fourteen = report["candidates"]["14"]
        self.assertEqual(five["per_missing_rank_minimum_at_basics"], [1])
        self.assertEqual(five["per_missing_rank_maximum_at_basics"],
                         list(range(54, 61)))
        self.assertEqual(fourteen["per_missing_rank_minimum_at_basics"], [1])
        self.assertEqual(fourteen["per_missing_rank_maximum_at_basics"],
                         list(range(54, 61)))
        self.assertGreater(five["full32_mean_lower_bound"]["decimal"], 0)
        self.assertLess(fourteen["full32_mean_upper_bound"]["decimal"], 0)

    def test_post_setup_47_card_cap_preserves_full32_signs(self):
        report = MODEL.build_report()
        five = report["candidates"]["5"]
        fourteen = report["candidates"]["14"]
        self.assertEqual(report["post_setup_draw_cap"], 47)
        self.assertAlmostEqual(
            five["known29_mean_difference_cap47"]["decimal"],
            0.7729606344168265, places=14)
        self.assertAlmostEqual(
            five["full32_mean_lower_bound_cap47"]["decimal"],
            0.09632071607461852, places=14)
        self.assertAlmostEqual(
            five["full32_mean_upper_bound_cap47"]["decimal"],
            0.8042960866063364, places=14)
        self.assertAlmostEqual(
            fourteen["known29_mean_difference_cap47"]["decimal"],
            -0.17335652345486624, places=14)
        self.assertAlmostEqual(
            fourteen["full32_mean_lower_bound_cap47"]["decimal"],
            -0.8497963853376167, places=14)
        self.assertAlmostEqual(
            fourteen["full32_mean_upper_bound_cap47"]["decimal"],
            -0.14202107126549512, places=14)
        self.assertGreater(five["full32_mean_lower_bound_cap47"]["decimal"], 0)
        self.assertLess(fourteen["full32_mean_upper_bound_cap47"]["decimal"], 0)

    def test_report_bounds_match_published_decimal_values(self):
        report = MODEL.build_report()
        five = report["candidates"]["5"]
        fourteen = report["candidates"]["14"]
        self.assertAlmostEqual(
            five["known29_mean_difference"]["decimal"],
            0.7729606344127024, places=14)
        self.assertAlmostEqual(
            five["full32_mean_lower_bound"]["decimal"],
            0.09447465803117794, places=14)
        self.assertAlmostEqual(
            five["full32_mean_upper_bound"]["decimal"],
            0.8042960866026065, places=14)
        self.assertAlmostEqual(
            fourteen["known29_mean_difference"]["decimal"],
            -0.17335652346055203, places=14)
        self.assertAlmostEqual(
            fourteen["full32_mean_lower_bound"]["decimal"],
            -0.8518424998420765, places=14)
        self.assertAlmostEqual(
            fourteen["full32_mean_upper_bound"]["decimal"],
            -0.14202107127064786, places=14)


if __name__ == "__main__":
    unittest.main()
