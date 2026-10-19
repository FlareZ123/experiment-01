"""Source-independent regression tests for the aggregate balanced e-process."""
import math
import unittest
from dataclasses import replace

from scripts.aichi_balanced_e_process import (
    Trial, assess_balanced_blocks, flawless_blocks_needed,
)


def block(index, nonwins=()):
    return [Trial(rank=r, candidate_first=f, won=(r, f) not in nonwins,
                  seed=f"b{index}:r{r}:first{int(f)}")
            for r in range(1, 33) for f in (True, False)]


class BalancedEvidenceTests(unittest.TestCase):
    def test_all_win_boundary_640(self):
        self.assertEqual(flawless_blocks_needed(), 10)
        self.assertFalse(assess_balanced_blocks([block(i) for i in range(9)]).target_demonstrated_statistically)
        result = assess_balanced_blocks([block(i) for i in range(10)])
        self.assertEqual((result.games, result.wins, result.nonwins), (640, 640, 0))
        self.assertEqual(result.first_threshold_block, 10)
        self.assertTrue(result.target_demonstrated_statistically)
        self.assertAlmostEqual(result.anytime_p_upper, .995 ** 640, places=14)

    def test_one_nonwin_under_perfect_alternative(self):
        blocks = [block(0, {(1, True)})] + [block(i) for i in range(1, 15)]
        result = assess_balanced_blocks(blocks)
        self.assertEqual(result.nonwins, 1)
        self.assertEqual(result.log_e_value, float('-inf'))
        self.assertEqual(result.anytime_p_upper, 1.0)
        self.assertFalse(result.target_demonstrated_statistically)

    def test_inexact_alternative_tolerates_nonwin(self):
        blocks = [block(0, {(1, True)})] + [block(i) for i in range(1, 15)]
        result = assess_balanced_blocks(blocks, alternative=.999)
        self.assertAlmostEqual(result.log_e_value,
            (15 * 64 - 1) * math.log(.999 / .995) + math.log(.001 / .005), places=10)
        self.assertTrue(math.isfinite(result.log_e_value))

    def test_reject_incomplete_duplicated_and_reused(self):
        with self.assertRaisesRegex(ValueError, '64 trials'):
            assess_balanced_blocks([block(0)[:-1]])
        b = block(0)
        b[1] = replace(b[1], rank=b[0].rank, candidate_first=b[0].candidate_first)
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            assess_balanced_blocks([b])
        with self.assertRaisesRegex(ValueError, 'Reused seed'):
            assess_balanced_blocks([block(0), block(0)])

    def test_reject_malformed_trials_and_probabilities(self):
        b = block(0)
        b[0] = replace(b[0], won=1)
        with self.assertRaisesRegex(ValueError, 'booleans'):
            assess_balanced_blocks([b])
        with self.assertRaisesRegex(ValueError, 'Require'):
            flawless_blocks_needed(alternative=.994)
        with self.assertRaises(ValueError):
            assess_balanced_blocks([], confidence=float('nan'))

    def test_heterogeneous_field_null_am_gm(self):
        # Half the rank/start cells have win probability .99, half 1.0.
        # H0 field average is exactly .995. A block likelihood-ratio's
        # expectation must be <= 1 even without identically distributed games.
        target, alternative = .995, .999
        p = [.99] * 32 + [1.] * 32
        expectations = [pi * alternative / target + (1-pi) *
                        (1-alternative) / (1-target) for pi in p]
        self.assertAlmostEqual(sum(p) / 64, .995)
        self.assertLess(math.prod(expectations), 1)
        self.assertAlmostEqual(sum(expectations) / 64, 1.)


if __name__ == '__main__':
    unittest.main()
