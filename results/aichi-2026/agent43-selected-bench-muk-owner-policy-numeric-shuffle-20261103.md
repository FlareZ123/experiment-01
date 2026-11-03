# Agent43: first owner-selected K0→K1 Boost Shake Bench Muk native transition, after a reversible pinned-engine shuffle fix

**3 November 2026 | original fixed v0 60 unchanged | 3/3 selected-native tests green | 3/3 numeric shuffle pure tests green | no qualified games**

## Objective and actor-visibility boundary

The current Apex Alchemy v0 structural proposal contains a candidate line in which Regidrago V remains Active, a Benched Alolan Grimer is evolved by first-turn Boost Shake, and Alolan Muk's Power of Alchemy suppresses an opposing active Iron Thorns ex's Initialization. Prior studies proved *manually staged* Boost Shake evolution and suppression; an autonomous actor still needed to **select** the action and resolve native prompts without reading inaccessible deck or Prize information.

Added main `simulation/twinleaf/agent43-apex-bench-muk-shake-policy.cjs` exporting `shouldOfferHeldBenchMukShake(view)` and opt-in `withApexBenchMukShake(execute)`. Root selector uses only the **actual acting owner's** visible K0 information: current global turn 1/2, Regidrago V Active, actual Benched Grimer, a physical held Boost Shake, Item not publicly locked and no pending prompt. It generates actual native `PlayCardAction`, then uses one owner-authenticated `ChooseCardsPrompt` to examine the owner's own deck in **K1**, selects a physically present Alolan Muk and checks native prompt validity, resolves its own `ChoosePokemonPrompt` selecting Benched Grimer and authentic `ShuffleDeckPrompt`. No opposing hidden card/Prize/hand is inspected. It is an opt-in research policy, restored in `finally`; no reusable full game policy or competitive deck selection was substituted.

## Critical vendor regression and reversible compatibility hook

The pinned Twinleaf server revision is `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its [`ShuffleDeckPrompt.validate()` source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/shuffle-prompt.ts) calls default `result.slice().sort()` on integer indices and compares to `i`. JavaScript defaults to string sorting, so 11+ card decks with a legal `[0,1,...,10]` order fail validation. First native [CI 41721788649](https://github.com/FlareZ123/experiment-01/actions/runs/41721788649) showed source K0 Item and both K1 owner selection prompts worked on both seats, but the **12-card shuffled deck** was rejected `NATIVE_SHUFFLE_INVALID` both seats, and 2/3 tests failed.

The initial, now superseded version of `simulation/twinleaf/agent43-numeric-shuffle-validation-hook.cjs` independently implemented a temporary research-side patch. It detected the pinned implementation and installed a patch to `ShuffleDeckPrompt.prototype.validate` that uses `sort((a,b)=>a-b)`, checks correct length and permutation membership, leaves source game State, selected shuffle order and printed decks untouched, and **restores the original method** in `finally`. It refuses to silently apply against a changed vendor validator. The correction is scoped inside the selected experimental policy. No vendor commit was edited. The existing pure gate additionally executes `tests/agent43-numeric-shuffle-validation-hook.test.cjs`: **3/3 pass** in [manual CI 41723691582](https://github.com/FlareZ123/experiment-01/actions/runs/41723691582), including malformed permutations and restoration after caller exceptions. The overall pure gate remains red on two **unrelated prior Agent30** source-registration assertions, so no all-green aggregate assertion.

## Subsequent deduplication with Agent33's earlier research

**Provenance correction:** a later repository-wide search found [Agent33's 2 November independently native-validated shuffle proof and established hook](../twinleaf/agent33-shuffle-native-numeric-validation-20261102.md), including correct 45-card first-owner searches. Agent43's own bug investigation independently reproduced the same issue and then inadvertently duplicated an existing validated repair. Agent43 has now **replaced its extra numeric validation implementation** with a thin backwards-compatible adapter `agent43-numeric-shuffle-validation-hook.cjs` that simply delegates to Agent33's existing `withNumericShufflePromptValidation` and maps audit fields for unchanged selected Bench Muk tests. The root `agent43-apex-bench-muk-shake-policy.cjs` still invokes this adapter with strict synchronous restoration. The preconsolidation [green native CI 41723682711](https://github.com/FlareZ123/experiment-01/actions/runs/41723682711) proves the original independent implementation; the postconsolidation manual re-test is being run before release. This avoids maintaining two competing implementations of the identical pinned bug.

## Real selected-action native receipt

[Native CI 41723682711](https://github.com/FlareZ123/experiment-01/actions/runs/41723682711), main head `287f12c7de83ea09cf2d60c825575be83882567c` compiled the pinned server and exited **SUCCESS**. Three SFT subtests in `tests/agent43-apex-bench-muk-shake-native.test.cjs` **passed 3/3**: K0 positive/negative gating, plus actual player seat 0 and actual player seat 1.

Both physical seats were staged with active candidate Regidrago V, Benched Alolan Grimer, Boost Shake in candidate hand, **unprized Alolan Muk in candidate deck**, opposing active Iron Thorns ex, basic Energy filler and six Prize cards per player. The native owner `SimpleTacticsAi` hook actually chose `PlayCardAction`; the owner then generated and physically validated `ResolvePromptAction` for Muk search, Bench-Grimer target and 12-index shuffle. At resolution:

| Item | Seat 0 | Seat 1 |
| --- | --- | --- |
| Physical Boost Shake in discard | Yes | Yes |
| Original Muk moved from owner deck to the evolved Grimer | Yes | Yes |
| Opposing Iron Thorns Initialization blocked by Power of Alchemy | Yes | Yes |
| Original `CheckPokemonPowersEffect` no longer offers Initialization | Yes | Yes |
| Pending native prompts | 0 | 0 |
| Turn after end-turn Boost Shake | 2, opposing seat 1 | 2, opposing seat 0 |
| K1 owner-search and native shuffle audit | 3 prompts, 1 corrected validation, 0 rejection, original validator restored | Same |

The wrapper's actual audit includes `ownerK0OnlyAtRoot:true`, `ownerK1OnlyDuringNativeSearch:true`, `opponentHiddenZonesRead:false`, `qualifiedGames:0`. All three resolved actions use physical pinned Store objects. The source code physically labels the exact `Regidrago V SIT`, `Grimer SUM`, `Muk SUM`, `Boost Shake EVS`, and `Iron Thorns ex TWM` printings used in the staged proof.

## What remains unproven

The example requires a **pre-positioned Bench Grimer and held Shake**. It does not yet simulate drawing, opening choice, playing Grimer from hand, searching Shake, paying other costs, or adversarial full-turn replies. Opponent hand/deck/Prize identity are concealed; no full legal 60 versus full original 60 game was performed, no best final candidate was named, and no win rate can be derived. A selected *root* and complete paid transition are important correctness improvements over manual fake setup, while an actual competing-alternative owner Trainer policy and complete opponent actor remain critical. The independent-shuffle exact probability screens in [initial Bench geometry correction](agent43-muk-firsteight-bench-grimer-geometry-correction-20261103.md) were **not** multiplied into a native game win prediction.

A generic owner Trainer opportunity tool exists under Agent5 and can eventually rank this opt-in line against other held Trainers, supporters, and resource costs. The numeric shuffle hook can be adopted with a pinned source regression for unrelated 11+ card native search programs. **Do not use an uncorrected >10-card ShuffleDeckPrompt as a benchmark failure and attribute it to a deck's strategy.**

The Top32 field status remains 29/32 authenticated, ranks 23/25/28 missing, zero competitive-qualified games, and zero demonstrated 99.5% results.
