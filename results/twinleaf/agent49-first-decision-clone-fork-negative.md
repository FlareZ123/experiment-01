# The first recorded source-ranked clone-policy action difference is not reproduced by a one-decision clone switch

**Agent 49, 17 October 2026.** Full pinned compilation, pure regression and all experiment steps **passed** in manually dispatched [CI 39026819857](https://github.com/FlareZ123/experiment-01/actions/runs/39026819857). Research owned, opt-in one-decision clone profile; vendor Twinleaf gitlink unchanged.

## Research question

A full switch from the original live-Card-aliased Simulator to the opt-in `post-super-v2` reconciled clone changed rank1 Shadow Rider against rank10 Regidrago weak-bot engine outcomes. The same exact source seed had 13 live `damageTakenLastTurn` field writes surviving complete natural bot decisions. Reversing those 13 numerical writes alone did **not** change the actual recorded game. At which action does the two full clone profiles first produce visibly distinct bot choices, and can we reproduce that alternative choice by switching the Simulator profile for just that exact decision on the unchanged original source game?

## Method

[`simulation/twinleaf/one-decision-clone-fork.cjs`](../../simulation/twinleaf/one-decision-clone-fork.cjs) wraps the actual `SimpleTacticsAi.prototype.decodeNextAction`. At one requested **global decision ordinal**, it installs [`withDecisionScopedDetachedSimulator`](../../simulation/twinleaf/decision-scoped-detached-simulator.cjs), which runs the existing post-super v2 repaired Simulator only during that synchronous decision and restores the prior Simulator export immediately after. All earlier and later decisions retain the original pinned profile. This is reversible, with passing [pure tests](../../tests/agent49-single-policy-decision.test.cjs) verifying one-shot install and correct method restoration.

The [source comparison](../../simulation/twinleaf/single-decision-clone-source-contrast.cjs) independently runs source-rank-1 vs source-rank-10 with (a) original Simulator for all decisions and (b) repaired v2 Simulator for all decisions, then compares the **reduced bot action schema** `{index,turn,actorSeat,action,name,handIndex}`. The first changed schema ordinal is selected for (c) a new source game with a **single corrected Simulator decision at exactly that ordinal**. The program asserts that **all previously recorded action signatures are identical to baseline before the fork**. It also reports completed-game summary/winner sensitivity.

Both 60-card lists are taken directly from `results/aichi-2026/full-decklists.json`. Seed **20261049**, action cap **350**. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and equal print-aware source deck hashes and first player are asserted for baseline/full-v2. The same `strictPromptValidation`, `forestSealSearchCorrection`, `supporterDecisionCorrection`, `doubleDragonRecovery`, `isolatePolicyRandomness` hooks are active across all branches.

## Results

The **first differing reduced action signature is global bot decision ordinal 110, turn 13, actorSeat 1** (Regidrago), where:
- Baseline original Simulator chooses `PlayCardAction`, `handIndex:1`.
- Full opt-in repaired v2 Simulator chooses `AttackAction`, `name:"Apex Dragon"`.

Outcomes across the **separate complete-game** branches:

| Arm | Single/full clone profile | Game actions | Engine-reported winner | `damageTakenLastTurn` source writes |
| --- | --- | ---: | --- | ---: |
| (a) Baseline | Original for every decision | **203** | seat0, rank1 | 13 |
| (b) Full v2 | Repaired for every decision | **192** | seat1, rank10 | 0 |
| (c) One-shot fork | Repaired only at decision **110**, original all other decisions | **203** | seat0, rank1 | unavailable in one-shot summary |

The one-shot wrapper was exercised **exactly once** at decision 110, turn 13, actorSeat 1. The control prefix of 109 reduced action signatures was asserted identical. On the one-shot fork, decision 110 **still chose `PlayCardAction` (handIndex 1)**, and every subsequent reduced action signature matched baseline: `firstDifferenceFromBaseline:null`. The one-shot fork's game summary SHA was exactly
`3e8c594d9ec5b02dd92926a3d1d2b3e1885aa1f2a8c633ae8d3cb7df9809687a`, identical to the baseline.

**Specific negative inference:** on the source state reached under the original profile, swapping to corrected clone *at decision 110 alone* is insufficient to reproduce the `Apex Dragon` choice seen at ordinal 110 after using the corrected clone on **all previous** decisions.

## What this does and does not establish

The source histories leading to turn 13 may already differ in earlier hidden prompt selections, source-Card debug/attack history fields, speculative alias effects, score construction, or other reducer state even if the **six-field action signature** is equal for the first 109 decisions. The same name/hand index does not prove identical `ResolvePromptAction.result`, engine State, hidden zones or random draws. Two complete games' decisions align only under the **coarse schema** tested. The one-shot test strengthens the argument that original/v2 winner reversal cannot be naively attributed to a single changed attack choice at turn 13; it is **not a source-state identity proof**.

There is no independent competitive matchup inference. The actor's full actual turn state, prompt arguments, true paper-game legality and strong both-seat opponent policies have not been independently validated. All winner labels are **weak bot engine completions**, qualified game count **0**, and 99.5% is unsupported.

## Next experiment: find the earliest **predecision live State** difference

Use the existing [source-zone and turn snapshot](../../simulation/twinleaf/source-zone-checkpoint.cjs) or [full own-data graph digest](../../simulation/twinleaf/store-data-graph-fingerprint.cjs) before each natural bot decision in the original and repaired trajectories. Find the first ordinal at which a source inventory, prompt, Energy or board flag differs **even when the chosen reduced action schema agrees**. Reproduce that source fork in a freshly typed prompt/reducer replay with exact card references and conditioned after-action checks. This follows the rank10 shared qualification packet's request for one complete source state and opponent continuation.

Do not promote a supposedly decisive `Apex Dragon` branch until the ancestor state fork and policy result are independently verified.
