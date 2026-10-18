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

## Completed compiled source result: all six treatments null

**Manual CI [39111013966](https://github.com/FlareZ123/experiment-01/actions/runs/39111013966), head `7d3d3f631ef280f277c5caa48e57a5dd8b41147a`, completed SUCCESS 18 October at 08:23 UTC.** The bundled pure descriptor tests and source-ranked factorial runner both passed. Original physical source deck hashes: `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` and `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`. Rank10 player seat **1** actually started first for every treatment.

The observer-only control exactly matched the unobserved original `selectTrajectory` projection. It counted **68 changed source Card fields in 34 of 189 complete decisions** under the stock Simulator: 19 `movedToActiveThisTurn`, 18 `cannotUseAttackUntilLeavesPlay`, 18 `whileInPlayOpponentWeakness`, 13 `damageTakenLastTurn`. First observed change was decision **5**.

| Restored on every decision | Own-property differences restored | First different *collected* policy action from stock | Game projection / engine winner |
| --- | ---: | --- | --- |
| `movedToActiveThisTurn` | **62** | none | identical / seat 0 |
| `cannotUseAttackUntilLeavesPlay` | **18** | none | identical / seat 0 |
| `whileInPlayOpponentWeakness` | **18** | none | identical / seat 0 |
| `damageTakenLastTurn` | **13** | none | identical / seat 0 |
| All three non-damage fields jointly | **98** | none | identical / seat 0 |
| All four jointly | **111** | none | identical / seat 0 |

Each treatment still ended after **203 real root actions**, with **189 complete bot decisions**, winner seat **0** and unchanged game projection SHA-256 `3e8c594d9ec5b02dd92926a3d1d2b3e1885aa1f2a8c633ae8d3cb7df9809687a`. The treatment restoring `movedToActiveThisTurn` recorded **62 repeated changes**, versus **19** in the stock observer: rollback makes previously reverted source-state writes recur on later bot decisions. These 62 counts are writes restored over time, **not** 62 unique physical cards or 62 independent causal experiments.

**Conclusion (bounded negative result):** Undoing any one, the three combined, or all four of these recorded Card primitive-field mutations *after the bot has selected an action* was **insufficient** to reproduce the fully detached Simulator's first selected-action divergence at ordinal 110 or its alternate engine terminal, within this fixed deal. This does not distinguish a mutation *during* candidate scoring from a restore performed afterward, nor does it cover prompt/closure metadata, all nested card references, counterfactual policy decision inputs, copied-attack session registry, or arbitrary simulation depth. The fully detached Simulator changes a broader clone model at the point of hypothetical evaluation. The causal defect could occur *inside* that evaluation before the selected action returns. Therefore the precise negative result should **not** be generalized to the claim that source aliasing is harmless or noncausal.

**Practical decision:** Deprioritize further post-decision rollbacks of these same four scalars on this seed. Test an exact same-source-decision fork with instrumentation **inside the policy's speculative action evaluation**, alongside full profile-isolated prompt histories and copied-attack-session correctness; alternatively shift work to the higher-priority real source-dealt attack-and-opponent-response packet. No independently qualified competitive game was produced.
