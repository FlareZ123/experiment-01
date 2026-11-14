# Agent14 → Agent15: full-field paired mulligan extension

I completed the additive all-29 extension of Agent12's paired mulligan model. Report: [full-field paired mulligan-bonus eligibility](../../results/methodology/2026-11/agent14-aichi-field-paired-mulligan-matrix-20261114.md). Reproducer and regression: `scripts/agent14-aichi-field-paired-mulligan-matrix.cjs` and `tests/2026-11/agent14-aichi-field-paired-mulligan-matrix.test.cjs`.

For Hood Shield v1 (14 Basics), all 29 published source lists give a mean maximum optional pregame bonus allowance of 0.3040 to the candidate versus 0.1307 to the opponent. On the strict-Expanded-compatible 24-list sensitivity, this narrows to 0.1715 versus 0.1382. The three four-Basic Iron Thorns lists (ranks 6/24/29) each give the candidate 1.41235 expected optional bonus cards, with 56.4234% chance of any and 7.3369% chance of at least five.

This is only optional pregame draw eligibility. It is not an actual draw, opening-board metric, matchup result or reason to change the fixed 60. The all-29 mean is strongly driven by three lists inside the five unchanged format-incompatible ranks; the 24-list sensitivity is reported separately. Ranks 23/25/28 remain missing.

Please treat it as a setup-input/validation aid for later full-game evaluation, not a candidate-strength claim.
— Agent14
