# Prospectively fixed source-Card field causality test

**Agent 49, 18 October 2026.** Research class: engine source-state integrity, **not** competitive performance.

## Fixed falsification question

The existing source-dealt rank1 Shadow Rider vs rank10 Regidrago, seed `20261049`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, shows a baseline/fully detached policy choice difference at decision **110** (baseline `PlayCardAction` hand index 1 versus post-super `AttackAction('Apex Dragon')`). [CI 39027244574](https://github.com/FlareZ123/experiment-01/actions/runs/39027244574) also confirmed original and post-super physical/source-zone snapshots match through the beginning of decision 110 and first diverge at predecision **111** in an unresolved `ChooseAttackPrompt` state. Correcting only the **110th** decision's Simulator did not change its selected action or original game terminal. These are bounded observational findings; they do not prove the complete source graphs or preceding policy random streams match.

Separately, the [damage-history-only rollback](agent49-source-decision-damage-history-rollback-null.md) eliminated all 13 recorded `damageTakenLastTurn` writes but retained identical baseline selected actions and engine terminal, so that single-field explanation failed here.

Test other observed live source Card fields by restoring their exact pre-decision own descriptors at the end of **each** real bot decision, without changing the original choice or touching vendor code:

- `movedToActiveThisTurn`
- `cannotUseAttackUntilLeavesPlay`
- `whileInPlayOpponentWeakness`
- `damageTakenLastTurn` as a repeated negative control

Each field alone; all three non-damage fields jointly; then all four jointly. For each arm, keep the source 60s, original deal, seed, action cap 350, and five existing research compatibility/policy flags identical. Compare an unobserved control to a read-only four-field observer to falsify instrumentation interference. Compare selected-action projections by global decision ordinal and source deck hashes/actual first-turn seat. The prediction of a causally sufficient field treatment is an earlier *real selected action* divergence or matched corrected behavior, **not** a mere changed observation count.

## Instrumentation and manual budget

- [Descriptor-safe hook](../../simulation/twinleaf/selected-source-card-field-rollback.cjs) with absent-versus-present own property restoration.
- [Five pure regressions](../../tests/selected-source-card-field-rollback.test.cjs).
- [Single-deal factorial runner](../../simulation/twinleaf/source-card-field-factorial-contrast.cjs).
- Existing, **manual-only** [decision history workflow](../../.github/workflows/twinleaf-decision-history-rollback.yml), now reusing its compiled pinned engine. No push-triggered Actions.

## Acceptance and limits

All arms must retain the same source inventory hashes and actual first-turn seat; observer-only must match unobserved trajectory projection exactly. A changed arm must report the first different selected action and both trajectories; **a null result is recorded as such** and must not be interpreted as proof of no source mutation. Record the exact CI run and commit after execution.

The field snapshot covers own properties on physical Card references from Active, Bench, hand, deck, discard, Lost Zone and Prize zones; it does not claim complete source-State equality, all nested objects, every attached card, or a full match replay. Root attack telemetry omits copied declarations, and the bots and official paper clock remain unqualified. The Aichi benchmark still has **zero independently qualified competitive games**.
