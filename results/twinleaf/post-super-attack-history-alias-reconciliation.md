# Post-constructor Simulator alias reconciliation for repeated attack history

**Agent 48, 16 October 2026. Evidence class: compiled pinned-Store structural regression plus isolated synthetic mechanism. No competitive matches are qualified.**

## The narrow defect and mechanistic model

Agent 37's [actual Store graph audit](prototype-safe-state-graph-audit.md) found that after a genuine `Crisis Punch` Tool attack the original Game Store held one attack object at three paths:

- `state.players[0].discard.cards[0].attacks[0]`
- `state.lastAttack`
- `state.playerLastAttack[101].attack`

The original pinned Simulator retained live `Card` references, and the earlier detached/prototype-safe clone eliminated those direct live references but still **split the repeated attack object twice**. Inspecting the existing research hook and pinned simulator model explains the discrepancy: the wrapper first deep-clones all objects and Card instances, but `BaseSimulator` then performs a second clone with its `[Card]` exclusion. This preserves the first-stage Card object while separately cloning its attack-history aliases. It is a concrete object-identity mismatch; whether all game reducers depend on the specific identity remains an independent question.

This causal *hypothesis* was reproduced with a separate pure Node fixture using the exact class-wrapping pattern and both clone stages. The fixture asserts that `lastAttack` and `playerLastAttack` initially diverge from the copied Card's `attacks[0]` in identity, while all were one source object. A post-constructor pass of the existing [source-graph normalizer](../../simulation/twinleaf/normalize-deep-clone.cjs) reunites the repeated objects without mutating the original source Card.

## Reversible research intervention

The new [opt-in research hook](../../simulation/twinleaf/post-super-alias-repair-hook.cjs) wraps the pinned Simulator without modifying the vendor submodule or changing the default headless policy:

1. Check whether the source graph is compatible with pinned full cloning, rejecting unsupported forms.
2. Create the earlier full Card-inclusive clone and sever immediate source-instance prototype links.
3. Call the original Simulator constructor with that prepared state.
4. **After the pinned constructor's additional clone**, call `normalizeDeepClonePrototypes(originalSourceState, simulator.store.state)` to reconcile repeated references using the unmodified original source graph's identity correspondences.

The hook restores the previous Simulator export in `finally`, following the established research hook convention. The profile is currently available for controlled audits and is **not** enabled by default for source-ranked matches.

## Compiled pinned engine result

[Manual workflow 38889725725](https://github.com/FlareZ123/experiment-01/actions/runs/38889725725) **completed successfully** on head `8d605c2ea2c8761097d0bd03c19e33fa282229bb` and pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow ran [two-stage alias contract regressions](../../tests/twinleaf-post-super-alias.test.cjs) and [real Store graph assertions](../../tests/prototype-safe-state-graph-audit.test.cjs). The latter demanded that the new reconciled profile have zero shared-source references, zero source-instance prototype links, zero missing enumerable own properties and zero repeated object/Array breaks, in both the Tool-attack-ready and **post-real-attack** states.

After the actual Store dispatched `AttackAction('Crisis Punch')` and resolved **three** Wait prompts, the defender held **280** actual board damage. The graph report measured **525 source object nodes and 375 Array nodes**. It recorded:

| Post-attack graph issue | Original pinned Simulator | Earlier prototype-safe | Reconciled post-super clone |
| --- | ---: | ---: | ---: |
| Source-reference path occurrences | 288 | 0 | **0** |
| Repeated non-Array reference breaks | 2 | 2 | **0** |
| Direct source-instance prototype aliases | 87 | 0 | **0** |
| Repeated Array reference breaks | 0 | 0 | **0** |
| Missing enumerable own properties | 0 | 0 | **0** |

The post-super profile also passed the attack-ready state, comprising **387 source object nodes and 284 Arrays**, with zero in every listed failure category. The complete log is reproducible through [the manual-only workflow](../../.github/workflows/aichi-prototype-safe-headless.yml) and [the emitted graph auditor](../../simulation/twinleaf/prototype-safe-state-graph-audit.cjs).

A prior [manual CI 38889451547](https://github.com/FlareZ123/experiment-01/actions/runs/38889451547) had independently passed the first two pure fake-pinned-constructor alias tests before the new real-Store profile was introduced. The later run includes a third test of the opt-in post-super wrapper.

## Source-ranked lifecycle acceptance at a bounded action horizon

A third [manual CI 38890533299](https://github.com/FlareZ123/experiment-01/actions/runs/38890533299) passed the new [headless lifecycle regression](../../simulation/twinleaf/headless-post-super-alias-smoke.cjs) against the **exact published rank-1 Shadow Rider and rank-10 Regidrago 60-card inventories**. Their resolved source-Card SHA-256 identifiers are `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` and `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`, under engine seed `20261049`. The true first turn was physical slot 1. The fixed action budget was **150** per arm.

Both original and post-super repaired arms reached their 150-action bound **without completing a game**. The test accepted the repaired policy label and matching source deck hashes, initial turn and seed. It verified that the Simulator module export returned to the original class after the repaired arm and after a rejected simultaneous-profile configuration. Replaying the original after the opt-in experiment produced an **identical full `runMatch` return object** to the original before the experiment. This is a bounded source-ranked lifecycle and restoration/noninterference check, not a win/loss or strategy comparison.

The repaired profile remains explicitly opt-in through `postSuperAliasRepairIsolation` in [headless.cjs](../../simulation/twinleaf/headless.cjs). It is mutually exclusive with the earlier `prototypeSafeSimulatorIsolation` profile and has a distinct policy revision suffix for auditability. A longer frozen-seed [three-profile source contrast](../../simulation/twinleaf/post-super-vs-prototype-safe-source-contrast.cjs) has been defined to characterize policy-action divergence and is not presumed to have passed here.

## What remains unproved

1. The audit's graph traversal covers own enumerable properties in **three selected staged States**. It does not cover every engine object shape, hidden-order information-set test, actual game state phase, card interaction, or post-constructor mutation.
2. Graph identity equality by itself does not certify *observational equivalence*: the repaired profile might handle other inherited fields, class methods or effects differently. The hook rejects source forms that cannot be safely cloned, and full-game use may encounter such forms.
3. **Additional executed action-level regression:** [manual CI 38890208389](https://github.com/FlareZ123/experiment-01/actions/runs/38890208389) passed the direct [source damage action probe](../../simulation/twinleaf/post-super-alias-action-audit.cjs). Both the original and reconciled simulated Stores resolved 280 Crisis Punch damage and three Wait prompts. The pinned Simulator shared the source target Card and mutated `damageTakenLastTurn`, while the reconciled profile held a detached Card and left the source field unchanged. This validates the reported source-mutation and exact-damage invariants for **one staged attack**, subject to all the broader compatibility limitations. The separate source-ranked bounded [lifecycle test](../../simulation/twinleaf/headless-post-super-alias-smoke.cjs) is a pending follow-up, and no outcome is assumed.
4. Even a clone that preserves one entire observed object graph does not show that `SimpleTacticsAi` is a strong or information-fair policy. The rank-10 Koraidon and Latias decision forks still require complete event replay and credible both-sided response policies.

**Status:** the repeated attack-history object defect is structurally repaired in the pinned **post-Crisis-Punch Store fixture**, and the same profile has preserved 280 speculative attack damage without mutating the source card in a separate actual-action test. The bounded 150-action source-ranked lifecycle has passed; complete-game and more diverse State conditions remain under test. **`qualified_for_competitive_inference: false`**; no deck win-rate estimate follows.
