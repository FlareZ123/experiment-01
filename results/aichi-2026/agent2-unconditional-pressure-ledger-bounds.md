# Unconditional v2 pressure classification requires authenticated, bounded Store roots

**Agent 2, 19 October 2026 UTC. Evidence class: pure intake-invariant regression, no newly played game.**

## Defect and scope

The existing `auditUnconditionalBilateralCensus()` correctly retained every registered arm independently of source-pressure selection. However its per-arm `pressureEvidence()` accepted the producer flags `accepted`, `effectVerified`, and `traceAuthenticated` with the matching source actor **without checking that the claimed effect could fit inside the recorded accepted-action ledger**. A row whose `sourcePressure.completionOrdinal === row.rootActionCount` was therefore called `verified-effect` even though accepted roots occupy indices strictly less than the completed root count. The strict bilateral mechanical gate independently rejects several malformed pressure/reply paths, but its decision was not consulted by the unconditional pressure-cell labels.

This matters when downstream readers use `both-witnessed`, `first-only-witnessed` or `second-only-witnessed` as descriptive source pressure. Incorrect labels could misdirect an already fragile comparative policy investigation, even while the census correctly refuses to certify wins.

## Correction

The source-pressure classification now requires all of the following in addition to the existing producer assertions:

1. Integer `rootActionCount`, `rootActionOrdinal`, `completionOrdinal`, `turnBefore` and `completionTurnBefore`.
2. `0 <= rootActionOrdinal <= completionOrdinal < rootActionCount`.
3. `turnBefore >= 1` and `completionTurnBefore === turnBefore`, matching the same-turn source-pressure completion lineage required by the strict v2 mechanical gate.

A genuine fully observed effect within a subsequently capped or failed game **remains a witnessed effect**. A terminal row with malformed or unbounded purported pressure is now `no-witness-in-terminal`; nonterminal rows remain `censored` unless an actually bounded effect is witnessed. The registered attempt count, the post-mulligan source-alignment distinction and both-start verification are unchanged. `unconditionalAttemptCensusReviewable` remains an accounting-only flag and cannot certify win rate or observation integrity itself.

## Regression and reproducibility

- [Implementation](../../simulation/evaluation/agent2-bilateral-unconditional-census.cjs), commit `962c383b449dc8f02f34a84a188d2ccd9c428596`.
- [Regression tests](../../tests/agent2-bilateral-unconditional-census.test.cjs), commit `60fde542f851b788c5f0e1c7be2a559d081d46e0`, including:
  - A fabricated source effect ending at `completionOrdinal = rootActionCount`, rejected without erasing the otherwise reviewable attempt.
  - A same-root claimed pressure whose completion-turn stamp differs from its initiation turn, rejected.
  - A negative root ordinal rejected.
  - A genuine bounded source effect that occurred before an action cap, retained.
- [Existing manual-only CI run 39327825356](https://github.com/FlareZ123/experiment-01/actions/runs/39327825356) **PASSED**, head `60fde542f851b788c5f0e1c7be2a559d081d46e0`, 19 October 2026 21:29 UTC. No new workflow or per-commit automation.

The test cases are synthetic authenticated-envelope fixtures passed through the real pure `auditBilateralV2()` intake; the results **do not verify original Twinleaf Store roots independently**, and the producer truth claims still require real root-ledger reconciliation. An internally consistent adversarially fabricated sequence can pass these static bounds. The correction only removes demonstrably impossible purported effects; it does not solve all producer-trust, full-policy hidden-information, paper-clock or game-fidelity questions.

The shared objective remains one fixed legal paper Expanded 60 against all 32 published placements. Source-list availability is still **29/32 exact**, and **zero games qualify** as competitive win-rate observations.
