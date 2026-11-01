# Agent 28: verified native Store Duskull PRE discard retrieval and no-target semantics

**1 November 2026. Evidence type: printed-source rule/text, pinned vendor bug inspection, eight successful real compiled native Store reducer/prompt regressions.** This is a **staged native single-attack effect**, not an original full-deck match, an autonomous source-policy endorsement, or a competitively qualified game.

## Why this matters to the source field

The published original Aichi source **rank 31 Dusknoir/Chimecho** contains **Duskull PRE 35**, whose printed *Come and Get You* attack costs one Psychic and reads *Put up to 3 Duskull from your discard pile onto your Bench*. The PRE printing inherits its attack reducer from Shrouded Fable Duskull.

The pinned Twinleaf vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, [SFA reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/duskull.ts), computes `hasDuskullInDiscard` using **`player.hand.cards.some(...)`**, then throws `CANNOT_USE_POWER` if none. The subsequent prompt, however, correctly asks for `Duskull` from **`player.discard`**. [PRE subclass](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts.ts) inherits this exact bug.

Consequently, when discard contains a legitimate Duskull and hand contains none, the original vendor can reject an eligible attack. When hand contains Duskull but discard contains none, its gate can pass into an unusable card-choice prompt. The supplied advanced rulebook **I.C-11** says that a Bench-placement attack with full Bench ends without putting anything there; **D-05** explicitly permits an attack with “up to” to choose zero. The correction therefore must allow a zero-choice branch as well as respecting free Bench capacity.

Agent25 concurrently implemented a **default-off, PRE-only** research adapter [`agent25-rank31-paper-duskull-discard-hook.cjs`](../../simulation/twinleaf/agent25-rank31-paper-duskull-discard-hook.cjs). Rather than creating a second live patch, Agent28 **deleted its broader duplicate SFA-base hook** and independently tested Agent25's narrow patch through the actual compiled vendor Store, original PRE card class, actual `AttackEffect`, genuine `ChooseCardsPrompt`, `ResolvePromptAction`, and native `MOVE_CARDS` zone transitions. No vendored source code was modified.

## Native outcome, including realistic negative controls

[Independent native tests](../../tests/agent28-native-duskull-discard-paper-hook.test.cjs) ran with both real players' Active Pokémon present, five instantiated Bench slots, six actual Prize cards each, and original printed PRE cards. Test entry invokes the native attack **effect reducer directly** to isolate the printed effect: it deliberately does **not** certify attack payment, first-turn permission, attack animations, AI prompt competence, or a natural dealt starting state.

| Frozen native test | Result |
| --- | --- |
| Original unpatched PRE rejects discard-only legal target with `CANNOT_USE_POWER` | **Pass: reproduced** |
| PRE-only opt-in corrected reducer prompts and moves discard Duskull into an open Bench slot | **Pass** |
| No discard targets: attack effect returns with no invalid prompt | **Pass** |
| Existing discard target: opting to retrieve zero leaves discard/Bench unchanged | **Pass** |
| Full five-slot Bench: no placement and no impossible prompt | **Pass** |
| One Bench slot, two eligible Duskull: native prompt refuses two and permits one | **Pass** |
| Other Duskull attack delegates to unchanged native reducer | **Pass** |
| Throw within patch scope restores the original PRE-inherited reducer | **Pass** |

**Successful compiled manual CI:** [Aichi Dusclops conditional self-KO run **41344758114**](https://github.com/FlareZ123/experiment-01/actions/runs/41344758114), Git head `65712020d5441b179df9f495fc68b5983f27930a`, native regression **8/8 passes**, broader workflow successful. This CI checked out and compiled the pre-existing pinned submodule. There is no new automated background or scheduled CI expense.

### Why the first native attempts failed

- [First run **41344013865**](https://github.com/FlareZ123/experiment-01/actions/runs/41344013865) reproduced the original bug but had **no instantiated Bench slots in the synthetic Player**, causing wrong positive-test assumptions. It is rejected as a positive confirmation.
- [Second run **41344248809**](https://github.com/FlareZ123/experiment-01/actions/runs/41344248809) had Bench slots but **zero Prize cards** for both sides. Native `Store.dispatch(ResolvePromptAction)` invokes the full-game winner checker: both players having already taken all Prize cards causes a **sudden-death reset**, physically emptying the test zones. Therefore transfer/zero-selection assertions were invalidated by unrelated game reinitialization. This is an additional warning for any partial Store fixture: **six actual Prize slots with cards** are required before interpreting real `ResolvePromptAction` side effects in attack phase.
- Corrected staging with six actual cards in each player's Prize zone yielded all eight passing tests in the third run. These are fixture/test-gate corrections, not a basis for retroactively censoring prior source-game errors.

## Integration and remaining acceptance work

The exact original rank31 source archive's two `CANNOT_USE_POWER` rows stay failed. The frozen rank31 source-replay program by Agent25 [`agent25-rank31-paper-duskull-retrospective.cjs`](../../simulation/evaluation/agent25-rank31-paper-duskull-retrospective.cjs) is an appropriate **separate, explicitly retrospective** test of whether the corrected PRE-only effect resolves those two original seeds while preserving real source/candidate 60s and both physical seats. A successful staged effect does not prove every autonomous prompt is handled, nor that the correction alone completes the matches.

The 99.5% single-deck target still has **29/32 exact original source 60s, zero competitively qualified games**. This work repairs a specific simulator fidelity obstacle for one original archetype and produces a reusable native negative-control regression. It does not promote any win percentage or decklist.
