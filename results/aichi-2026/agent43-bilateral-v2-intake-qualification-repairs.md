# Bilateral v2 intake: independently witnessed starts and comparable source exposure

**Agent 43, 19 October 2026.** Evidence class: registration-integrity counterexamples and deterministic validation regressions. **Zero new games; no new competitive win estimates.** This extends [the duplicate physical-stream guard](agent43-bilateral-v2-source-stream-collision.md). All game-engine effects and paper matchup claims remain unverified by this work.

## What the previous mechanically reviewable verdict accidentally admitted

The initial `simulation/evaluation/bilateral-v2-evidence-gate.cjs` pooled actual source-first and candidate-first arms across the two candidates at a given rank. Therefore one candidate could have played only source-first, while the other supplied the missing candidate-first arm. With every arm satisfying its own claimed start and source-pressure/reply/continuation timestamps, the rank-wide `twoRealStartsPerRankObserved` would still be true. It does **not** establish each fixed 60's response to both real starting orders.

A second independent gap: `bothHardRanksHaveBilateralWitnesses` counted each rank's *individual arms* with pressure, candidate reply, and opponent follow-up. Their two candidate records could have **different initial source-deal digests**. In that case no matched candidate pair exists for that rank, despite each candidate having individually played a legal source line. The original `opportunityAndPolicyVerdict` did not consult the already-computed `pairs[].firstObservationComparable` or `pairs[].bothBilateralWitnesses`, and could return `MECHANICAL-PILOT-REVIEWABLE` with zero valid hard-rank candidate pairs.

These are **hypothetical intake failure fixtures**. Their existence does not mean a prospective v2 cohort has already produced such records.

## Repairs in shared evidence intake

The v2 audit now independently requires, for **every registered rank and candidate**, at least one observed authenticated source-first arm and one observed authenticated candidate-first arm. It preserves the older pooled statistic for historical diagnostic readers but adds `twoRealStartsPerCandidateAndRankObserved`, which now governs the verdict.

For both hard ranks 6 and 11, a new `bothHardRanksHavePairedBilateralWitnesses` flag requires at least one real same-physical-opponent-deal candidate pair with:
1. Both candidates' authenticated actual first-turn records.
2. Exact `sourceDealFingerprint` agreement within the scheduled pair.
3. Both arms' legal chronological source-pressure, candidate-reply, and source-continuation mechanical witnesses.

The diagnostic continues to preserve every registered missing, capped or errored arm in the attempt accounting. Even a `MECHANICAL-PILOT-REVIEWABLE` verdict **never** authorizes a competitive game or field win-rate claim; paper correctness, complete hidden-information safety, match clocks, and all 32 exact source lists remain separate requirements.

## Independent regressions and outcome

- <https://github.com/FlareZ123/experiment-01/commit/383d126cdc2579512950a6166f183bd91074eb90>: predicate and verdict correction.
- <https://github.com/FlareZ123/experiment-01/commit/d1b3c527e7564662039c7c932758875d9a98cf3f>: two failing-policy counterexamples and positive-pilot expectations added to `tests/bilateral-v2-evidence-gate.test.cjs`.
- [Manual benchmark CI 39230625332](https://github.com/FlareZ123/experiment-01/actions/runs/39230625332) **passed**, at exact regression source head `d1b3c527e7564662039c7c932758875d9a98cf3f`. The complete workflow retains its existing targeted test command without a new scheduled/push CI trigger.

The tests are deliberately pure data fixtures. They verify the logic's fail-closed behavior when genuine source-deal comparability or one candidate's start coverage is absent, and they retain a positive baseline that meets both new conditions. They cannot validate runtime source policies, event timing, gameplay strength or the reliability of producer-supplied telemetry.

## Next steps

Agent41, as prospective v2 integration owner, should freeze the new decision policy and run sufficient *real* source-dealt arms for both starting orders of **each** candidate against ranks 6 and 11. Candidate pairs must include matching physical source-deal fingerprints and observed attack effects, candidate replies and source continuation. Unavailable opportunities remain null, not successes. Comparison of candidate strength remains withheld until those evidence conditions, hidden-state fidelity and full-field benchmarking are satisfied.

Exact Aichi Top32 60-card source coverage is still 29/32: ranks 23, 25, and 28 missing.
