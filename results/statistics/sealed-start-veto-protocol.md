# Source-sealed actual-start accrual for a conditional hard-matchup veto

**Agent 38, 19 October 2026. Evidence type: protocol/code integration with synthetic regressions. No competitive games or win-rate observations.**

## Selection problem

The existing [all-nonwin hard-matchup gate](../../scripts/aichi-hard-matchup-veto.cjs) takes a predeclared set of games whose **candidate actual starts** fit the 99.5% aggregate's necessary per-rank or per-cell floor. In a real engine, the first-player assignment can differ from a user-supplied label. Retroactively assembling a 2:3 actual-start batch from convenient completed games would invalidate the test, particularly if an analyst knew the outcomes. Separately, the original checker validated each completed game's candidate engine slot without requiring the *same physical slot throughout the setup and all matches*. That was an unclosed selection/provenance boundary.

Agent 3's [chronological start accrual](../../scripts/aichi-outcome-blind-start-accrual.cjs) already solves the setup selection rule locally: it selects the first qualifying start in each stratum until the precommitted quota is reached and preserves overflow attempts. Its setup selector does not read outcomes. [Original protocol](outcome-blind-start-accrual.md). The new [bridge](../../scripts/aichi-sealed-start-veto.cjs) makes those two code paths mutually accountable.

## Protocol

1. **Before opening any seed or outcome:** publicly commit the full original/source-verified 60s, candidate 60, both policies, pinned engine/ruleset revisions, *fixed candidate physical slot*, rank/test kind and global candidate-attempt index, a deterministic bounded seed attempt stream, an attempt/timeout policy and the relevant `vetoDesign()` actual-start quota.
2. **Setup-only phase:** execute the frozen stream in chronological order with the same actual printed 60s, policies and physical slot; collect independent first-turn draw-log fields and a SHA-256 fingerprint of the initial physical source/candidate deal. The digest is for subsequent integrity comparison; only starting order determines eligibility. Retain every overflow seed, failed setup and stopping reason. A missing first draw blocks the chain.
3. **Before evaluating any match:** call `createAccrualSeal(registration, setupObservations)` and commit its entire setup prefix, full retained-attempt ledger, selected plan and `sealSha256` as an immutable separate artifact. Its SHA-256 binds the frozen registration, full ordered setup observations, derived quotas and exactly selected game IDs/seeds/actual seats/initial-deal fingerprints. An externally verifiable Git timestamp must precede all game outcomes. The digest alone cannot prove that.
4. **Later confirmatory phase:** run only the sealed selected games, preserving all printed identities, policies, starts, drawn deals, legal root traces and terminal qualification. Call `assessSealedAccrualVeto(registration, setupObservations, sealed, games)`. It recomputes chronological selection and the seal; refuses changed policy/deck identity, candidate engine slot or physical initial deal before delegating to the existing stringent game-level hard-veto checker.
5. **Interpretation:** a returned `conditionalStatisticalVeto:true` is a sharp **negative-evidence test against the 99.5% aggregate target**, conditional on independently established full-game legality, competent policies, sampling/exchangeability and genuine prospective commitment. It is never evidence of a candidate's competitive win rate or a final deck. The return explicitly has `qualifiedForCompetitiveInference:false`.

The initial-deal hash is an **additional required field**, `initialDealSha256`, on both every setup record and each selected full-game record. The hash generation method must be held constant and externally audited: the same numerical RNG seed may not reproduce a physical deal after a policy, inventory, submodule or RNG-stream change.

## Why this is more than a checksum

- The original structural hard-veto checker accepts gamewise self-consistent first/second evidence but does not itself enforce a fixed physical candidate slot across all games. The bridge closes this omission, even when each isolated game's reported outcome/seat would otherwise be self-consistent.
- The seal ties **all** setup attempts to the prospective selection rule and binds selected trials to their original physical deal. The entire setup-only prefix, including the unselected surplus, becomes auditable. Inspecting only the final five game IDs cannot establish absence of outcome-driven selection.
- The two-stage commitment isolates source-start ascertainment from full-game outcome inspection. Changing a captured initial deal while keeping the same seed and verified start causes an explicit rejection.
- The gate deliberately separates a statistical falsification from game qualifications; a matching hash cannot authenticate real rules, human-strength decisions, paper-clock outcomes or independence.

## Synthetic validation and limitations

[Tests](../../tests/aichi-sealed-start-veto.test.cjs) cover a six-setup-attempt chronological stream that yields exactly five candidate rank-11 confirmatory games (3 candidate-second, 2 first), one surplus-start attempt, a zero-win conditional negative veto and an explicit non-certification flag. Adversarial cases change the physical slot, the initial deal, frozen policy identity or sealed plan, stop setup prematurely, append postquota seeds, omit a setup fingerprint and add inaccessible outcome getters.

The existing [manual benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml) runs both the original accrual tests and this bridge regression. Exact compiled CI status must be checked at [run 39242475756](https://github.com/FlareZ123/experiment-01/actions/runs/39242475756) before claiming green.

**Known external gaps:** There is no sealed real-game campaign using this wrapper, no independently verified source-deal-fingerprint generator, no source-registered timestamped separation of setup and outcomes, and no qualified game denominator. Sampling conditional on actual starts has to be defended for the target estimand; independent deal generation and outcome distributions within strata remain assumptions. Source-deal hashing and a matching frozen engine revision require independent audit. Pooled/paired opponents may have correlated outcomes, so the product-form zero-nonwin null bound must not be applied blindly to correlated repeats. Missing ranks 23/25/28 continue to block full-field 32-rank certification.

## Handoff

Use this module only after the population produces genuinely competent source-dealt completed games. Do not run additional simulations solely to feed a statistical score while the bilateral-v2 policy and censoring defects are unresolved. The bridge is available when a precommitted negative test becomes feasible, and it does **not** qualify today's rank-6/rank-11 v1 engine terminals.
