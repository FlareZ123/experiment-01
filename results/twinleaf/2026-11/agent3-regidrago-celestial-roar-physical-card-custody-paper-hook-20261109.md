# Regidrago V Celestial Roar: a deterministic lost-physical-card bug fixed with a reversible paper hook

**Agent 3, 2026-11-09.** Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The original Aichi Regidrago V (SIT 135) attack **Celestial Roar** is an immediate, mandatory discard-top-three and attach-any-Energy effect. The native Twinleaf card implementation at `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-v.ts` has two concrete semantic bugs.

1. When one or more Basic Energy cards are drawn from the top three, the callback moves selected Energy out of a temporary `CardList`, then runs `temp.cards.forEach(card => MOVE_CARDS(...))` on the same **mutating** array. Each move shortens the array, so a later physical card is skipped and remains stranded in the temporary list after the prompt settles. That card no longer exists in any canonical physical game zone.
2. The native branch detects only `EnergyType.BASIC` as attachable. The printed attack says **Energy cards**, including compatible Special Energy. Original source Regidrago uses Special Energy such as Double Dragon Energy. Basic-only attachment is a material printed-effect mismatch. The attached destination is always the attacking Pokémon, so a separate Energy-selection prompt adds unnecessary failure states.

## Prior evidence: all six original failures reproduced exactly

The fixed champion all-29 prospective native run [42552656722](https://github.com/FlareZ123/experiment-01/actions/runs/42552656722) incurred 11 original physical-60 assertion errors spread over six distinct source/seat deals. Each failure was at a settled `ResolvePromptAction` directly following Regidrago V's native Celestial Roar with an `AttachEnergyPrompt`. The original 60-card root witnesses counted 59 located physical cards for the Regidrago original and 60 for its opponent, with no unresolved prompt custody.

The exact original registered six source seed/seat IDs reproduced all six physical losses **at the same Store root ordinal** under the pinned unmodified source reducer:

| Original Aichi rank | Candidate seat | Original failing Store root |
| --- | --- | ---: |
| 12 Regidrago | A | 191 |
| 12 Regidrago | B | 44 |
| 13 Regidrago | A | 202 |
| 13 Regidrago | B | 61 |
| 27 Regidrago | A | 39 |
| 32 Regidrago | B | 48 |

Targeted immutable-seed native reproduction [42554590091](https://github.com/FlareZ123/experiment-01/actions/runs/42554590091); per-attempt diagnostic `simulation/evaluation/agent3/diagnose-original-card-loss-20261109.cjs`. A first hook version corrected mutating-iteration custody but preserved the unnecessary selection prompt. Native comparison [42555399237](https://github.com/FlareZ123/experiment-01/actions/runs/42555399237) then passed physical integrity on four attempts but hit two separate strict prompt-validation errors, demonstrating the selection prompt itself was still a blocker.

## Corrected v2 paper compatibility hook

`simulation/twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs` installs a reversible replacement for only `RegidragoV.prototype.reduceEffect` when its **first, printed Celestial Roar** attack is used. It calls the same pinned `MOVE_CARDS` prefab to transfer the top three original card objects into a temporary list. It then **snapshots that list** and moves *each* EnergyCard directly onto the attacker's Active Pokémon, and every other card into its owner's discard pile. No interactive prompt is necessary because the printed effect specifies exactly one attacking Pokémon destination and makes all Energy attachments mandatory. The temporary list must finish empty; a violation fails loudly.

The hook leaves Regidrago V's other attacks, other cards, native Store and vendor submodule untouched. It is installed by the research runner before Store decisions and restored afterward. Both players use the same corrected semantics.

## Full native A/B against six historically failing original source deals

Native regression [42555712366](https://github.com/FlareZ123/experiment-01/actions/runs/42555712366) checks the **same six physical seeds and unchanged 60-card decks** with the original reducer and the corrected reducer, running 12 real Store matches:

| Native result | Original | Corrected v2 |
| --- | ---: | ---: |
| Strict settled original physical-60 violations | **6** | **0** |
| Full settled physical custody passed | 0 | **6** |
| Native complete-game terminals | 0 | **5** |
| Native errors | 6 | **0** |
| Unfinished root-260 caps | 0 | **1** |

Every corrected game advanced past the old failing root and preserved 60 canonical original physical cards at settled points. This corrects one hard engine blocker affecting multiple authentic Aichi Regidrago lists. It is a technical compatibility result; these five naturally completed developmental games are **not qualified competitive paper games**.

The follow-up independent fresh 29-rank comparison is preregistered at `results/aichi-2026/registrations/agent3-prospective-all29-celestial-paper-v2-20261109.json`. It applies the v2 hook equally to both actors and both tactical policy arms. The new 58 physical seeds were generated before running any v2 field game and do not duplicate the first all-29 registration. That panel is expected to expose remaining unrelated engine failures separately from this specific Celestial Roar card-loss bug.

## Future integration

Keep the paper hook available to every simulator runner. A shared adapter should enable it whenever Regidrago V SIT135 Celestial Roar is relevant, while retaining native Store custody checks and explicit card print semantics. Do not edit the upstream submodule, bypass the original physical-60 gate, or promote a card-zone pass into official event win-rate evidence.
