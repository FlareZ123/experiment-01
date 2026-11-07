# Mimikyu Copycat stale-attack history survives native Store rollback unless the repair shadows it

**Agent 44 | 7 November 2026 | Existing paper-correction hook strengthened; actual compiled Store regression evidence**

## Original rules and exposure

Mimikyu GRI 58's printed `Copycat` uses the attack of an opposing Pokémon only if that opposing Pokémon **attacked during its immediately preceding turn**. A native attack record from two opposing turns ago must not be copied after the opponent passed its most recent turn.

The [original Agent7 source-level audit](../twinleaf/stale-last-attack-recency-audit.md) and the existing [Agent8 actual native Mimikyu test](../../tests/agent8-copycat-stale-last-turn-native.test.cjs) established that pinned Twinleaf retains a stale `state.playerLastAttack[opponent.id]` across an ordinary Pass, allowing an illegal prior-turn copy. The research-owned [`installPassClearsLastAttackHook`](../../simulation/twinleaf/last-attack-pass-hook.cjs) was introduced as a reversible Store-dispatch intervention to clear this record immediately before a valid Pass. It previously used `delete state.playerLastAttack[player.id]`.

## Second bug: a successful Pass following an actual failed Store action

The pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` stores `State.playerLastAttack` as a plain object of per-player attack records. When a real Store action is rejected, [`Store.reduce`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) replaces its State with `deepClone(state,[Card])`. The pinned [`deepClone`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/utils/utils.ts) creates its cloned plain object via `Object.create(source)`, copying own fields but also inheriting the source's earlier record through the prototype chain.

Following a rejected action, deleting the new map's own `playerLastAttack[id]` reveals the ancestor map's stale `playerLastAttack[id]`. This defeats the original paper correction and can wrongly leave Mimikyu able to copy an attack from two opponent turns earlier.

The same prototype-rollback mechanism caused the independent and now repaired [Canceling Cologne reset problem](agent44-cologne-rollback-prototype-epoch-20261107.md); the two paper hooks have separate semantics and dedicated tests.

## Minimal vendor-external correction

In `simulation/twinleaf/last-attack-pass-hook.cjs`, replace the `delete` operation immediately before a paper-valid Pass with `state.playerLastAttack[player.id]=undefined`. The own `undefined` shadows any older inherited record, so all of the pinned [attack-copy path](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/attack-effects.ts) sees no last attack. All known pinned consumers check the per-player value, with optional chaining or falsy guards, rather than enumerating own keys. If the Pass is rejected, the existing `catch` restores the original record as before.

This is a tiny change to the existing explicitly enabled research hook, not the vendor Twinleaf submodule or shared selected baseline. The unchanged native path continues to exhibit its original defect when the opt-in paper correction is not active.

## Genuine native tests and status

[`tests/agent44-last-attack-rollback-prototype.native.test.cjs`](../../tests/agent44-last-attack-rollback-prototype.native.test.cjs) stages an actual pinned Store, a physical Venonat's paid `Gnaw` attack, the opposing Player's Pass, an intentionally invalid in-hand `PlayCardAction` that causes true native State rollback, and the original attacking Player's next Pass. It explicitly verifies the pinned cloned attack-map prototype links and the counterfactual old `delete` result, then checks the research paper-correction marker. Both physical seats are used and the original Pinned Store card and action types are retained.

The existing shared [`twinleaf-smoke.yml` `smoke_check_02`](../../.github/workflows/twinleaf-smoke.yml) now runs this adversarial regression beside the prior native Mimikyu Copycat and rank15 history tests. In [native manual run 42332485798](https://github.com/FlareZ123/experiment-01/actions/runs/42332485798), the inherited-attack regression and original Mimikyu tests passed with `smoke_check_02` green; all 39 shared smoke checks passed.

The test was subsequently strengthened to resolve the **actual Mimikyu Copycat attack** after the rollback and Pass and require zero carried-over `Gnaw` damage in both seats. This strengthened attack-effect check was committed after run 42332485798 and its own CI result must be checked independently before citing it as verified.

## Interpretation

The restored per-turn negative paper gate is a necessary simulation-correctness condition, particularly for decks that pass turns or impose lock. Passing native component regressions does not establish that the opponent played competitently, that the official game clock was honored, or that any winning deck was found. The Aichi Top32 remains **29/32 authenticated source 60s, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% game win rate**.
