# Copied-attack selected-identity loss on a cloned Twinleaf State

**Agent 12, 18 October 2026.** Scope: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, Regidrago VSTAR SIT with a Goodra VSTAR LOR copied-attack session on an injected board. Research-only opt-in State-scoped session and Simulator transfer hooks. Neither a natural source-dealt game nor win-rate evidence.

## Falsification and baseline

The copy-session transfer developed on 17 October repaired cross-Store session loss and copied EndTurn callbacks. A separate condition was still untested: `shouldDelegateCopyAttackSession` only accepts damage lifecycle effects whose `effect.attack` is reference-identical to one of `session.clonedAttacks`.

The pinned `Simulator` constructs a `deepClone(state, [Card])`. That clone excludes physical Card objects from copying but produces fresh ordinary `Attack` objects inside `state.playerLastAttack`. By contrast, the prior experimental session transfer shallow-copied the original session's `clonedAttacks` array, preserving its old attack references. This potentially loses `AfterDamageEffect`, `AfterAttackEffect`, and other identity-filtered copy-session callbacks in a cloned State.

The new [regression](../../simulation/twinleaf/copy-session-cloned-attack-identity.cjs) opens a session on an established Regidrago/Goodra board, constructs an actual pinned Simulator with the opt-in session inheritance wrapper, then dispatches `AfterDamageEffect` through the original and clone `Store.reduceEffect` paths. The source reducer records an event only when delegated with `this` equal to Regidrago.

[Manual-only compiled CI 39085437605](https://github.com/FlareZ123/experiment-01/actions/runs/39085437605) **passed** at commit `d80690edbba4d1c70469d359332cbbc2b987d4f0`. Its baseline observed:

| Measurement | Observed |
| --- | --- |
| Parent history attack equals source session's selected clone | true |
| Simulator's selected attack shares parent attack object | false |
| Parent source-session accepts the `AfterDamageEffect` attack | true |
| Untouched session array accepts the clone's `AfterDamageEffect` attack | false |
| Delegated source callbacks in actual Store reducers | `["real"]` |

Thus a cloned `AfterDamageEffect` was not delegated despite an inherited session. The callback recorder differentiates copy-session delegation from ordinary source-card fan-out. The test observes a real engine identity mismatch under this opt-in configuration, not just a static analogy.

## Narrow opt-in repair under investigation

Commit `c14e0a206b96fd518cccadafc78612af0beb01af` modified only the research-side, fail-closed compiled CommonJS loader. For each inherited session it finds the original selected copied attack in the parent `playerLastAttack[playerId]` history and replaces that entry in the cloned session's `clonedAttacks` with the corresponding clone-State attack object. It verifies the corresponding attack name before rebinding. The original array and the vendor submodule remain unchanged.

The test's next revision, `a30bda96732634963d5de3f5f60a572e2d7de5ef`, asserts that a deliberately unmapped session still fails the identity predicate, while the actual transferred session delegates the cloned `AfterDamageEffect`. [Manual compiled CI 39085747403](https://github.com/FlareZ123/experiment-01/actions/runs/39085747403) **passed** at `a30bda96732634963d5de3f5f60a572e2d7de5ef`. The stale parent array remained a negative control (`naiveCloneMatch:false`), while the actual transfer produced source callbacks `['real','speculative']`, and the complete existing Apex regression workflow passed. This establishes a narrow identity-rebinding correction in an injected Store/Simulator reducer test; it does not establish full source-dealt or adversarial-game correctness.

## Boundaries and next tests

Only the most recent copied attack represented by matching parent/cloned `playerLastAttack` is rebound. Older sticky sessions and references held in future prompt callbacks or effects are not proven to be mapped. The test starts from an injected stable State; it does not demonstrate that an after-damage callback is reachable in a particular competitive hypothetical decision. Also inspect the cloned State's nonmutation, invalid-history rejection, and detached-Card transfer. Do not enable this opt-in adapter as a default headless policy or promote any source-dealt engine game on this basis.

The field benchmark remains **29/32 exact published lists and zero independently qualified competitive games**. No 99.5% win-rate claim follows.

## Independent branches and paid-attack follow-up

[Manual compiled CI 39086167904](https://github.com/FlareZ123/experiment-01/actions/runs/39086167904) passed a [branch isolation and malformed-history test](../../simulation/twinleaf/copy-session-clone-branch-guard.cjs). A clone whose selected attack history name was intentionally corrupted was rejected; two independent cloned States produced copied-source callbacks, followed by continued callbacks in the original parent: `['parent','branch1','branch2','parent']`. The test still invoked directed AfterDamage effects on injected boards.

[Manual compiled CI 39087122797](https://github.com/FlareZ123/experiment-01/actions/runs/39087122797) passed a stronger [paid-attack-origin test](../../simulation/twinleaf/copy-session-paid-attack-clone-identity.cjs). A real `AttackAction` used Regidrago's paid Apex Dragon with GGF, chose Goodra VSTAR's Rolling Iron through the real ChooseAttack prompt, dealt 200 damage, and recorded 80 next-turn damage reduction. Three WaitPrompts were resolved to reach a stable State. A pinned Simulator without session inheritance omitted a directed copied-source AfterDamage callback; the opt-in mapped-transfer Simulator restored that callback, and the parent retained its own: `['parent','with-transfer','parent']`. This broadens evidence from a manually opened session to one opened by a real paid attack, but the follow-up AfterDamage event remains directed by the test.

This does not establish that any qualified source-dealt rank-10 policy scored such a cloned AfterDamage callback; there are still zero independently qualified competitive games.
