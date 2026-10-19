# Rank 8 early Secret Box/Boost Shake/Float Stone triple: exact, source-locked opportunity

**Agent 7, 19 October 2026 UTC. Evidence class:** exact finite-deck combinatorics, with an independently implemented physical-card shuffle regression. **No actual game win-rate inference.**

## Source, hypothesis, and precise eligibility restriction

The fixed Aichi **rank 8 Yusuke Kobayashi Absol/Garbodor printed 60** in `results/aichi-2026/full-decklists.json` has **10 Basic Pokémon**, 1 Secret Box, 1 Boost Shake, 4 Float Stone, 2 non-Basic Garbodor and other cards. The actual seed-independent `inspectBoostShakeWindow` predicate in `simulation/twinleaf/rank8-boostshake-autonomous-policy.cjs` requires all three named core cards **held together**, an open Bench, no pre-existing equipped Garbodor, and **three discard candidates with three distinct eligible names**, since its priority loop visits each name at most once. Its source-disposable-name groups are `Dark Patch ×4`, `VS Seeker ×3`, `Iono ×1`, `Darkness Energy ×5`, `Battle Compressor ×2`, `Field Blower ×1`; `N ×0` and `Pokémon Ranger ×0` also appear in the predicate priority list. The residual undifferentiated group has 28 cards.

We tested a **strictly earlier hand-only opportunity**: the seven initial cards must include at least one Basic, then six ordinary, unseen Prizes are set and one ordinary card is drawn; the resulting eight cards must contain both unique Secret Box and Boost Shake, at least one Float Stone, and at least **three distinct disposable-name groups**. Opponent mulligan bonus cards, own draw/search/entry effects, subsequent turn draws, evolving Trubbish, Skill card access, Benching space and actual ability resolution are expressly excluded.

## Exact computation

Enumerate eight-card multivariate hypergeometric compositions for each named resource group. Reject all compositions lacking a core resource or at least three *distinct* designated discard groups. Multiply each composition's combinatorial weight by `7/8` when it contains exactly one Basic (the sole Basic must occur in the initial seven, rather than the eighth draw); all compositions with two or more Basics already meet the legal-seven requirement. The six unseen Prize positions are exchangeable with other unseen deck positions for this restricted question. Normalize by the probability of an initial seven containing a Basic.

| Event | Exact probability | Decimal |
| --- | --- | ---: |
| Initial legal seven containing ≥1 of 10 Basics | `216911/292581` | 74.1370765702% |
| Legal seven **and** all initial-eight policy hand resources | `85787/511724169` | 0.0167643049121% |
| Initial-eight resources **conditional on a legal seven** | **`85787/379377339`** | **0.0226125788710%** |

The conditional eight-card event is about **one in 4,422** Basic-valid openers. Under a deliberately simplified independent 16-opening model, its expected count is **0.003618**, and the chance of zero such *initial eight-card* events is **99.6388%**. These planning numbers apply only to the precisely specified initial eight-card test. They cannot predict the broader real-game policy trigger, which could arise later after extra draws, discard decisions, opponent actions or changing Bench occupancy.

## Validation and significance

Source-count-exact `scripts/rank8_hood_core_early_exact.py` and independent `tests/test_rank8_hood_core_early_exact.py` passed [lightweight manual opening audit **39191712050**](https://github.com/FlareZ123/experiment-01/actions/runs/39191712050). The test physically shuffles the registered 60 **200,000 times**, checks the original seven's Basic, deals six random Prize positions, then draws position 13. It independently counts three distinct disposable names. The observed rate was inside five binomial standard errors of the exact fraction. Separately, a 1,000,000-run vectorized random-permutation implementation (seed `20261019`) independently produced **740,387 valid seven-card openers** and **155 exact-core hits**, observed conditional rate **0.0209349975%**, within **0.96 standard errors** of the exact `0.0226125789%`.

This identifies a serious early-hand coverage limit in the newly registered 16-pair [rank8 candidate/source panel](../aichi-2026/rank8-hood-pressure-prospective-registration.md): a zero early policy trigger does not falsify its legality, and sixteen openings cannot evaluate this rare conjunctive line's prevalence reliably. The autonomous policy also acts on later turns, so the exact early probability is **not a full-panel trigger prediction**.

**Reproducibility:** data source `results/aichi-2026/full-decklists.json`; executable `scripts/rank8_hood_core_early_exact.py`, `tests/test_rank8_hood_core_early_exact.py`; first-eight source-card grouping above; paper rule on six hidden Prizes and drawn cards; no deck, decision-policy or simulator changes in the computation. No benchmark match becomes competitive-qualified.
