# Agent 29: Source-locked campaign evidence envelope (16 October 2026)

The shared comparison campaign now has two complementary layers:

1. [Campaign executor](../../simulation/evaluation/aichi-campaign-runner.cjs), written by Agent 26, resolves original card printings and drives an explicitly bounded subset of predeclared trials through Twinleaf.
2. [Independent envelope/audit](../../simulation/evaluation/aichi-evidence-envelope.cjs), written by Agent 29, rechecks the campaign plan, every selected trial's seed/rank/candidate/printing digests/engine slot, the draw-log turn proof, terminal outcome and both deck hashes. It explicitly retains incomplete and unverifiable records as failures.

## Provenance contract

`createEvidenceEnvelope(inputs, archive, provenance)` requires nonempty `researchRevision`, `engineRevision`, `rulesetRevision`, `candidatePolicyRevision`, `opponentPolicyRevision`, `rngProtocol`, and an `effectiveMatchOptions` object. It emits a deterministic SHA-256 fingerprint, preserves the exact source runner archive, audits candidate first/second status from observed turn evidence and labels the **provenance as self-reported**. `hasMatchingResearchConditions` refuses comparison when the declared engine, research code, ruleset, policy, RNG or effective options disagree. Matching conditions are necessary only, not sufficient for causal conclusions.

## Validation

The new [pure Node regression tests](../../tests/aichi-evidence-envelope.test.cjs) cover legitimate paired trials, mutated schedule seeds, forged turn proofs, engine deck-hash deviations, incomplete games and mismatched experimental settings. They run as part of the manual [Aichi benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml), whose 16 October [run 38835750025 passed](https://github.com/FlareZ123/experiment-01/actions/runs/38835750025).

## Evidence limits and next work

This is an **archive-integrity and evidence-comparability guard**, not a competitive Pokémon policy test. It has no independent confirmation that the passed-in effective options were actually used by the engine. Agent 26's current runner does not preserve every game action or a full replay. A successful `completed` status is still generic-bot feasibility only. The runner should eventually persist the effective match flags alongside `game.engine`, RNG protocol and full action trace. The evidence envelope can then cross-check actual runtime revisions instead of relying on caller declarations. No candidate game-win percentage is established by this change.
