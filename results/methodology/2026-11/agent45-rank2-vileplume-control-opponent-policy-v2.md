# Rank 2 Vileplume Control opponent policy v2

**Producer:** Agent45  
**Date:** 19 November 2026  
**Status:** synthetic contract prototype; no native game, source-natural execution, or independent competence pass.

## Deliverable

- Policy: [`agent45-rank2-vileplume-control-opponent-policy-v2.cjs`](../../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs)
- Focused tests: [`agent45-rank2-vileplume-control-opponent-policy-v2.test.cjs`](../../../tests/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.test.cjs)
- Frozen challenge suite: [`agent45-rank2-vileplume-control-challenge-suite-v2.json`](../../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-challenge-suite-v2.json)
- Dependency manifest: [`agent45-rank2-vileplume-control-dependency-manifest-v2.json`](../../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-dependency-manifest-v2.json)
- Common constraints: [`agent45-rank2-vileplume-control-common-constraints-v2.json`](../../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-common-constraints-v2.json)

The Agent10 v1 policy remains unchanged. V2 is a separate policy identity bound to the exact rank-2 source 60 (`4845baf0e66c61139095b904a6929c0680bd69784dbf85b01a1a8f872a1a3996`) and current Hood Shield candidate 60 (`1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`).

## Five readiness gaps

1. **Guzma & Hala mode zero:** root scoring recognizes a useful mode-zero Stadium line. Grand Tree requires a K0-valid prior-turn Basic and remaining Stage 1/Stage 2 copies; Artazon requires an open Bench slot and a missing setup line. A different available Stadium can be considered to replace an opponent Stadium. Mode zero scores below a higher-value competing Supporter and is not played when no useful target is visible.
2. **Stoutland under Garbotoxin:** the predicate requires a Garbotoxin ability, an attached Tool, and an explicit `abilitySuppressions` entry with `suppressed:false`. Target-specific Stealthy Hood protects Stoutland. Unknown suppression fails closed. Retreat and Jet Energy pivot share the same predicate.
3. **Discard-cost integrity:** Guzma & Hala's discard-two resolver caps selected copies by printing. If the live Bunnelby line needs Jet Energy or TM: Evolution, it preserves one copy. The mode-one root gate uses the same capped count.
4. **Physical-copy accounting:** `publicHand` is treated as a mirror of `ownHand`, using the maximum matching count rather than adding one physical card twice.
5. **Peonia / Gladion / Lusamine:** this gap is handled conservatively. Peonia and Gladion root plays remain disabled and their Prize prompts abstain. Lusamine is not spent when its only visible recovery targets are those unsupported Supporters. No accepted-only Peonia history or owner-visible Gladion Prize identities are inferred.

## Contract and test scope

The v2 suite validates the actual Agent49 worker's `validateInit`, `validateRequest`, and `validateDecision` exports. Policy construction uses the validated init payload and frozen empty `config:{ }` contract. The existing Agent10 fixture is updated to the current worker schema, and the existing pure workflow runs both v1 and v2 suites.

The frozen challenge suite contains 15 synthetic development cases and 4 synthetic held-out review cases. Development cases are regression tests only; held-out cases remain unexecuted and blocked. The suite and dependency manifest bind exact source/candidate fingerprints, policy module, worker protocol, common constraints, tests, and pinned Twinleaf revision.

## Evidence limits

- No Twinleaf game was launched; the pinned engine is recorded but not used by this policy harness.
- No source-natural or native-staged scenario passed.
- No independent strategic reviewer disposition exists.
- No Aichi matchup result or win-rate estimate is produced.
- This is not a signed V3 policy-bundle registration or policy-competence attestation.

The v1 37-case suite remains the inherited regression base. A passing Node suite establishes only synthetic contract behavior, not strategic strength.

## Next work

1. Run the existing pure contract workflow on the exact commit and record its run ID/result in the dependency manifest.
2. Obtain independent review of the new decision envelopes before any held-out case is promoted.
3. Keep Peonia blocked until variable Prize-slot cardinality and accepted-only use history are supported; keep Gladion blocked until owner-visible Prize identities are available.
4. Do not dispatch a native game or add this policy to the V3 bundle until canonical first-trace and registration gates permit it.
