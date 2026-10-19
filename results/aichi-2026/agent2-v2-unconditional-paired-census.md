# Agent 2: independent unconditional v2 paired-attempt census

**19 October 2026. Evidence class: validated preregistration-intake methodology, without prospectively observed v2 games.** This is a direct implementation of the [Critic's 09:36 paired-selection correction](../../communications/broadcast/20261019T0936Z_critic_bilateral_selection_gate.md). It does not modify the historical bilateral v1 archive, invent v2 seed results, certify a competitive win, or select a stronger 60.

## Decision protected

A candidate's initial 60 and decision policy can change whether the opposing source ever establishes the monitored Garbotoxin or Iron Thorns pressure. A gate requiring **both** initially aligned candidates to suffer the same source pressure is conditional on a downstream response. It can erase real, potentially favorable asymmetric pair observations. An aligned starting source draw does not prove that the two subsequent source continuations will be identical.

The previous [strict v2 intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs) properly authenticates complete source-pressure → candidate-reply → source-continuation packets and still stands unchanged. A *separate* [unconditional paired-census module](../../simulation/evaluation/agent2-bilateral-unconditional-census.cjs) now calls that strict validator first, preserving its printed-60, policy, seed, start-lineage, source-deal and terminal integrity assertions, then produces a distinct report from **every registered pair**, regardless of observed pressure.

## Inclusion, categories and interpretation

- **Attempt accounting:** every predeclared candidate arm remains in the denominator. Missing data, `engine-error` and `action-cap` are displayed and never assigned an invented winner. Two arms are paired only when authenticated physical source-start fingerprints and actual first-player lineage align.
- **Four cells among aligned pairs with two engine-terminal observations:** `both-witnessed`, `first-only-witnessed`, `second-only-witnessed`, and `neither-witnessed`. The `candidateOrder` field explicitly binds `first` and `second` to the registered candidates, usually rank-1 reference and New Moon respectively.
- **Separate nonterminal categories:** `censored-or-missing` and `unaligned-start-or-deal`. A capped arm with an already authenticated source-pressure event still records `verified-effect` per arm, but its pair belongs in the censored category. A terminal with no authenticated source pressure is labeled `no-witness-in-terminal`, **never proven absence of possible pressure**.
- **Orthogonal verdicts:** `pairedAttemptCensusReviewable` requires the full attempt census, matching initial physical source deals and valid first-turn coverage for *each* candidate in both hard ranks. It deliberately does not require source-pressure witnesses. The original `opportunityAndPolicyVerdict` is retained as `originalStrictMechanicalVerdict` for conditional stress-test coverage. Both methods leave game-win certification and comparative-strength inference **false**.

This is a **reporting and evidence gate**, rather than a randomized, paper-fidelity or owner-information-safe policy implementation. Even an entirely aligned paired attempt corpus cannot be used as an unbiased estimate of inventory advantage while candidate or source decision quality is unknown, hypothetical engine scores read concealed cards, real match timing is unmeasured, or simulator card rules remain unverified.

## Validation

New [seven pure regressions](../../tests/agent2-bilateral-unconditional-census.test.cjs) deliberately cover complete paired rank6/rank11 two-seat attempts, reference-only source pressure, neither-pressure pairs, action caps plus engine errors, incomplete or mismatched physical source deals, fraudulent first-turn or policy-hash claims, and authentic pressure previously observed within a subsequently capped run. They also verify that the strict mechanical verdict can remain `HOLD-OR-INCOMPLETE` while the unconditional aligned-attempt census remains reviewable.

[Manual GitHub Actions CI 39265632942](https://github.com/FlareZ123/experiment-01/actions/runs/39265632942) **passed** at repository head `6c33d6618798edc4b47b3c98cfbe6a7e171af3d2`. The new test was added to the existing **manual-only** `.github/workflows/aichi-global-field-gate.yml`; there is no per-push simulation spend. No Twinleaf compile is necessary for this pure intake-gate unit test because it operates on authenticated observation records and the existing pure gate.

## Required next handoff

Agent 41 or the actual bilateral-v2 integration owner should run **one preregistered fresh, paired, both-actual-start** source-60 pilot for ranks 6 and 11 under one frozen candidate algorithm, retain every attempt and terminal or cap, and feed the complete record to `auditUnconditionalBilateralCensus(plan, archive)` alongside the strict pressure/reply audit. Produce a human-readable table that includes the four pressure cells and separate censored/unaligned categories, candidate attacks, opponent responses and card-text/clock/info-set vetoes. Treat asymmetric pressure as a possible causal investigation lead, never automatically as proof one inventory is better.

**Benchmark remains 29/32 exact Aichi Top32 source 60s; zero competitively qualified games; no demonstrated 99.5% and no validated single final 60.**
