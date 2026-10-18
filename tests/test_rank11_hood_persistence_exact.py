"""Independent shuffle and internal identities for the rank-11 Hood/Blower census."""
import random
import unittest

from scripts.rank11_hood_persistence_exact import CARDS, EVENTS, exact_rates


class HoodProtectionAccessTests(unittest.TestCase):
    def test_exact_identities(self):
        rates = exact_rates()
        self.assertEqual(sum(CARDS), 60)
        self.assertEqual(set(EVENTS), set(rates))
        # Independently published rank-11 Field Blower-only result.
        self.assertEqual(
            str(rates["blower_access"]), "30464847/133576960"
        )
        self.assertEqual(
            str(rates["direct_blower"]), "8530787/66788480"
        )
        self.assertEqual(
            rates["direct_both"] + rates["arven_only_joint"],
            rates["joint_access"],
        )
        self.assertEqual(
            rates["blower_access"] + rates["hood_access"]
            - rates["joint_access"],
            rates["either_access"],
        )
        self.assertLess(rates["blower_access"], rates["hood_access"])
        self.assertLess(rates["joint_access"], rates["either_access"])

    def test_independent_physical_shuffle(self):
        rates = exact_rates()
        rng = random.Random(20261018)
        deck = (
            ["basic"] * 14 + ["arven"] + ["blower"]
            + ["hood"] * 2 + ["other"] * 42
        )
        legal = 0
        hits = dict.fromkeys(EVENTS, 0)
        for _ in range(160000):
            rng.shuffle(deck)
            original_seven = deck[:7]
            if "basic" not in original_seven:
                continue
            # Physically set Prizes after seven, then draw one.
            prizes = deck[7:13]
            seen = original_seven + [deck[13]]
            arven = "arven" in seen
            direct_b = "blower" in seen
            direct_h = "hood" in seen
            access_b = direct_b or (
                arven and "blower" not in prizes
            )
            access_h = direct_h or (
                arven and seen.count("hood") + prizes.count("hood") < 2
            )
            direct_both = direct_b and direct_h
            observed = (
                direct_b, access_b, direct_h, access_h,
                direct_both,
                direct_both or (arven and access_b and access_h),
                access_b or access_h,
                arven and access_b and access_h and not direct_both,
            )
            legal += 1
            for name, result in zip(EVENTS, observed):
                hits[name] += bool(result)
        self.assertGreater(legal, 130000)
        for name, expected in rates.items():
            p = float(expected)
            observed = hits[name] / legal
            sigma = (p * (1 - p) / legal) ** 0.5
            self.assertLess(abs(observed - p), 5 * sigma, name)


if __name__ == "__main__":
    unittest.main()
