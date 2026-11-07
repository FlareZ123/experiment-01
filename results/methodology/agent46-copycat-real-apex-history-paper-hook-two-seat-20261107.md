# Genuine prior Apex Dragon, copied-attack history and Mimikyu Copycat: corrected two-seat native evidence

**Agent 46, 7 November 2026.** Paper Expanded; pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. This report **supersedes the invalid copied-attack no-payoff claim** in [the earlier retracted diagnostic](agent46-apex-copy-choice-without-payoff-pinned-native-20261107.md), and corrects the previous claim in [the original Mimikyu report](agent46-mimikyu-copycat-nongx-apex-native-block-20261107.md) that raw native real-prior-Apex history retained the declared attack after a copied payload selection.

## Decision-relevant finding

A **correctly answered** actual native Regidrago VSTAR SIT `AttackAction('Apex Dragon')`, with a real `ChooseAttackPrompt` selecting Dragon Dialga-GX UPR's **Overclock** attack object, **does apply the payload**: the attacking player's empty hand becomes six cards, and its eight-card deck becomes two cards. This holds with Mimikyu in physical owner seat 0 and owner seat 1.

The same native prompt resolution **overwrites `playerLastAttack[Regidrago].attack` with `Overclock`**, although the printed attack announced and used was **Apex Dragon**. The attached Advanced Player's Rulebook **II.C-18** explicitly explains that the declared copied attack retains its original name (Zoroark Foul Play illustration); its damage and effects are copied from the chosen payload. Under Mimikyu GRI's printed non-GX Copycat condition, losing the original Apex name can change the subsequent allowed line.

Two pre-existing reversible, default-off research hooks, `copycat-declared-history-hook.cjs` and `copycat-compat.cjs`, can be **jointly installed for a genuinely preceding Regidrago Apex native turn**. They restore the declared Apex record and remove the additional native `copycatAttack` eligibility veto for this specific non-GX Regidrago Apex source. Both seated trials then actually allow Mimikyu GRI to use printed Copycat, answer a native `ChooseAttackPrompt` with its own discarded Dragon Dialga-GX UPR **Timeless-GX**, and settle 150 damage, `usedGX:true`, `usedTurnSkip:true`, `usedTurnSkipClearArmed:true`, with no unresolved prompt or exception. These values are directly observed from the pinned Store, rather than inferred from a proposed action or a promise of later simulation.

## Fully compiled evidence

**[Manual GitHub Actions run 42333138227](https://github.com/FlareZ123/experiment-01/actions/runs/42333138227) SUCCESS**, `main` research commit `5ad4229352fbea265fa7422414877e3e99566260`. All 16 job steps passed, including Node native source compilation, raw `ChooseAttackPrompt` reference validation, direct Overclock comparison, genuine prior Apex sequential execution, the new two-seat hook comparison, and isolated nested-copy controls. The SFT is [`simulation/twinleaf/agent46-apex-history-copycat-two-seat-native.cjs`](../../simulation/twinleaf/agent46-apex-history-copycat-two-seat-native.cjs).

| Observable in each owner physical seat | Unpatched control | Opt-in existing history + Mimikyu non-GX hooks |
| --- | --- | --- |
| Native Regidrago originally announces | `Apex Dragon` | `Apex Dragon` |
| Regidrago's actually copied Dragon payload | `Overclock` | `Overclock` |
| Regidrago owner hand / deck after Apex | `6 / 2` | `6 / 2` |
| Previous attack saved in Regidrago native history | **`Overclock`** | **`Apex Dragon`** |
| Mimikyu sees nested own-discard Dragon prompt | No | Yes |
| Mimikyu explicitly selects `Timeless-GX` attack object | No | Yes |
| Damage to opponent Regidrago VSTAR | `0` | **`150`** |
| Mimikyu GX allowance used | No | **Yes** |
| Additional-turn state armed | No | **Yes** |
| Unresolved prompts / native errors | None | None |

Both seats agree. The control's Mimikyu has no 150-damage payoff and no GX use; after `Overclock` is incorrectly recorded as the source last attack, the next Copycat cannot follow the intended Apex Dragon -> own discarded Timeless-GX line. The treatment makes that line available through two explicit, reversible changes. The real source Apex occurs before the Mimikyu attack in one native state: **no synthetic prior-attack injection** in this test.

For complete chronology and independent provenance, see the distinct [native two-seat source/Overclock comparison](../../simulation/twinleaf/agent46-regidrago-apex-overclock-payload-native.cjs) and the [native consecutive-turn runner](../../simulation/twinleaf/agent46-mimikyu-apex-consecutive-native.cjs). The latter validates that `prompt.validate(selectedAttack) === true` before `ResolvePromptAction(prompt.id, selectedAttack)`. A serialized `{index, attack}` wire-format value is invalid for this raw native Store interface; [`tests/native-choose-attack-answer.test.cjs`](../../tests/native-choose-attack-answer.test.cjs) catches that former test defect.

## Why the older evidence needed correction

The older compiled 01:29 investigation used a serialized prompt response rather than the selected **Attack object**, producing a false absence of Overclock draw and Timeless-GX payoff. That claim is invalid. The corrected 01:31 CI attempt [42324567476](https://github.com/FlareZ123/experiment-01/actions/runs/42324567476) was stopped by a stale test assertion that expected the engine to retain Apex after prompt settlement; its actual first-seat log exposed `Overclock` recorded and six cards drawn. The successful current CI covers both seats and runs all steps. Do **not** revive the old no-payoff conclusion.

The original source-level observation that the native Mimikyu copy-prefab rejects `copycatAttack:true` remains relevant: Mimikyu's printed Copycat excludes **GX attacks**, and Regidrago's Apex Dragon is a **non-GX** attack. However, the older real-prior-attack test falsely appeared to retain `Apex Dragon` in native history because it had used the malformed serialized answer, which short-circuited the generator. Current corrected source history actually records the payload name. **Both history and eligibility mechanisms are therefore separate, reproducible fidelity problems.**

## Scope, controls and next admission

The tests start from **staged pre-funded and pre-evolved boards** with known in-discard Dragon payloads, real native Store prompts, actual player-seat reversal and physical hand/deck zones. They do not run either historical original 60 from a random shuffle, establish resource acquisition, certify a full end-to-end paper game, or demonstrate a Prize-winning counterline. No KO occurs from the observed 150-damage attack alone. They demonstrate a **conditional game-rule-capability difference** under specific board conditions.

The next significant integration gate is to have the Issue #25 shared bilateral policy owners independently incorporate both opt-in fixes as a **joint, frozen, separately registered treatment**, with owner-safe source identity, validated actual prompt choices, paper resources, opponents' replies and whole-game outcomes. Record the raw/hooked difference with original printed rank1 vs each Regidrago original, both source seats, all seeds, and zero artificial history metadata. A 25-minute paper-match adjudication remains missing. No upstream vendor edits and no selected final fixed 60.

**Field status unchanged:** 29 of 32 authenticated Aichi Top 32 original name/count inventories; ranks 23, 25 and 28 not authenticated; zero competitively qualified games; no 99.5% win-rate estimate.
