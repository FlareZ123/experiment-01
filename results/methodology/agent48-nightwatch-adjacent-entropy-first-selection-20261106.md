# First Night Watch paper-random sensitivity arms share their first physical selection

**Subsequent native archive check:** [Independent 29-card first-prompt verification](agent48-nightwatch-real-original-first-entropy-corrob-20261106.md) confirms the first picks 3/3/3/3 in previously executed CI42134459451. The original report below predates that raw ZIP check. Its no-original-replay wording applies only to later CI42135169470, which skipped its optional sensitivity step.


**Agent 48 | 6 November 2026 | independently reproduced RNG/protocol diagnostic.**

## Acceptance-changing finding

The four fixed entropy seeds in `simulation/evaluation/agent43-nightwatch-paper-random-skyliner-pair.cjs`, **20261106, 20261107, 20261108 and 20261109**, do not provide four distinguishable first-card choices at a direct Night Watch random-hand prompt. With the pinned `seededRandom` xorshift32 generator and the existing uniform without-replacement sampler, **the first selected physical hand position is identical in all four arms for every legal hand size 1 through 60**.

This is **deterministic adjacent-seed coupling**, not a proof the underlying random sampler is biased for a uniformly drawn 32-bit seed. The later card selections can differ, and so can later attacks. The exact frozen original full physical deal and all historical outcomes remain unchanged. Do not count four nearby entropy seeds as independent evidence of complete paper-random hand-disruption sensitivity.

## Source and method

- The frozen selected original experiment is [Agent43's Night Watch same-deal sensitivity runner](../../simulation/evaluation/agent43-nightwatch-paper-random-skyliner-pair.cjs), with original source seed **3792360798**, rank3 seat **0**, rank1 seat **1**, and four adjacent diagnostic entropy seeds. Its direct-only patch is [Agent43's original-print sampler](../../simulation/twinleaf/agent43-nightwatch-paper-random-resolver.cjs). It samples an integer index using `floor(random() * remaining.length)` and removes that position, then repeats without replacement.
- The seed source is [the pinned research headless RNG](../../simulation/twinleaf/headless.cjs), whose `seededRandom` uses xorshift32 `state ^= state << 13; state ^= state >>> 17; state ^= state << 5`, returning `(state >>> 0) / 2^32`.
- New [read-only, independent first-draw oracle](../../scripts/agent48-nightwatch-entropy-coupling.cjs) and [regression tests](../../tests/agent48-nightwatch-entropy-coupling.test.cjs) reproduce the xorshift first variate; tests compare that oracle directly against the actual `headless.seededRandom` first output. A separate local Node 22 and Python cross-check independently produced the same numeric positions. **The new committed test has not yet been reported as executed in repository CI.**

| Fixed original entropy seed | First xorshift uniform | First position if opponent hand has 29 cards | First two indices if 29-card hand |
| --- | ---: | ---: | --- |
| 20261106 | 0.1300719992723316 | 3 | [3, 4] |
| 20261107 | 0.13000906398519874 | 3 | [3, 2] |
| 20261108 | 0.13019792758859694 | 3 | [3, 0] |
| 20261109 | 0.13013499230146408 | 3 | [3, 0] |

For example, conditional on 29 exchangeable physical hand positions and independent uniform samples, all four first choices agreeing would have probability `1/29^3 = 0.0000410020911`. That calculation is a reference benchmark, **not a p-value for observed native games**; the selected deterministic seeds themselves are fixed and known to be coupled. No source hand-size assumption is needed for the stronger exhaustive 1..60 first-index result.

## Reproducible independent seed-domain proposal

The new script offers a **separate future diagnostic protocol**. For each arm, SHA-256 of `['agent48-nightwatch-entropy-v1', 3792360798, 0, armIndex, nonce]` (UTF-8 JSON, first little-endian 32-bit word) yields distinct nonzero xorshift seeds, retrying nonce in the exceptional collision/zero case. Four current proposals:

| Diagnostic arm | Proposed SHA-separated seed | First position at 29 cards | Full first two indices at 29 cards |
| --- | ---: | ---: | --- |
| 0 | 166542289 | 14 | [14, 9] |
| 1 | 1949982598 | 22 | [22, 12] |
| 2 | 3281288805 | 22 | [22, 2] |
| 3 | 978100785 | 12 | [12, 7] |

These proposed seeds have **only the unavoidable 1-card-hand first-position collision** among sizes 1..60. This strengthens diagnostic coverage of the initial random selection; SHA-derived pseudorandom seeds do not establish statistical independence, competent opponents, or uniform paper-randomness in actual gameplay. Four deterministic arms remain four **retrospective sensitivity paths from the same selected original physical deal**, not four sampled games.

**Preservation rule:** keep Agent43's preregistered old four arms, their seed labels and any outcomes. Register a *new separately named* post-correction sensitivity set before executing it, and do not retroactively replace the predeclared entropy seeds. If actual first-prompt hand size and random-picked positions are archived, compare them under both protocols. Preserve missing/errors and all four old rows.

## Current status and limits

At the time of this analysis, manual [CI run 42135169470](https://github.com/FlareZ123/experiment-01/actions/runs/42135169470) completed **successfully** for the dedicated staged Night Watch native tests, but its separate **frozen-original same-deal sensitivity step was skipped**. Thus this report does **not** infer a corresponding native original-game outcome or prove the predicted first index actually occurred in the original replay. The identified coupling is proven by the committed seed schedule and matching pinned first-draw algorithm, independently of any Game State and without opponent private-card access.

The broader benchmark remains **29 of 32** authenticated original sixty-card inventories (ranks 23, 25, 28 missing), **zero competitively qualified games**, no selected best fixed 60, and no 99.5% win-rate evidence.
