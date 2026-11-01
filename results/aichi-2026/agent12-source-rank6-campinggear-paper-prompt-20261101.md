# Agent 12: original rank-6 Camping Gear search-cardinality failure and native continuation

**1 November 2026 | one retrospectively selected authentic original physical deal, development-only.** This is a concrete paper-versus-native prompt defect in the exact printed **Camping Gear BST 122** used by original Aichi rank-6 Iron Thorns, plus a positive ordinary search and opponent reply. It is **not** a tournament win, a preregistered deck-strength comparison or a validated global prompt guard.

## Fixed experiment and exact provenance

- Original opponent: rank-6 Iron Thorns original authenticated 60; opposing reference: rank-1 champion original authenticated 60. Printed identities remained unchanged.
- Frozen original source seat **1** went first, seed **1460221882**, originally registered development arm `6:0:A:champion-reference`.
- Both native control and legal/illegal search treatments reproduced the same initial source-deal SHA256 `08bf124fc4b6e3f2355f247e850372ac877fef22f5f96042cefd507c8befa406` and full physical-deal SHA256 `762ac14bd5e767eadc84e5b04182ec41119239bb274203c908f9b3e9bad8caf5`. This certifies initial deal equality for completed arms, not all-game physical custody.
- Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; 50 accepted-action cap; frozen historical actor policy. The selected native first-turn source was known from a previous archived hand witness and **is retrospectively selected**.
- [Compiled native CI 41325207794](https://github.com/FlareZ123/experiment-01/actions/runs/41325207794), artifact [13090218996](https://github.com/FlareZ123/experiment-01/actions/runs/41325207794/artifacts/13090218996), ZIP SHA256 `58c3339657a7e2d7494effaa88e25cf2f839b325fe15170781735c0b8d15235d`; [compiled cardinality CI 41325571068](https://github.com/FlareZ123/experiment-01/actions/runs/41325571068), artifact [13091191956](https://github.com/FlareZ123/experiment-01/actions/runs/41325571068/artifacts/13091191956), ZIP SHA256 `ed9b7be63b4cd893030c503a2a5df7ebb54ba2fd029792805aff17d2f9480fc3`.
- Native driver: [source-dealt same-initial-deal runner](../../simulation/twinleaf/agent12-campinggear-rank6-native.cjs), [reversible owner-only replacement](../../simulation/twinleaf/agent12-native-campinggear-after-pass.cjs). The runner evolved after the cited executions; compare each archived `schema` and Git SHA with the raw artifact before attempting replication.

## Actual real Store observations

| Native arm | Source T1 | Search reply | Search native result | Post-T1 |
| --- | --- | --- | --- | --- |
| Original baseline | Pass, root 7 | None | None | Accepted WaitPrompt closure T1→T2 |
| Valid Gear | Camping Gear root 7 | One physical Double Colorless Energy SUM | Accepted, from source deck into actual source hand, 46→45 deck cards, 6→7 hand cards | Accepted WaitPrompt closure T1→T2 |
| Paper-invalid zero | Camping Gear root 7 | Empty array | **Accepted**; no source-deck card taken, native prompt `validate([])===true` | Continued normally through 50-action cap |
| Paper-invalid two with headless strict preflight | Camping Gear root 7 | Two owner-deck cards | **Rejected by the research headless prompt-integrity check**, with `Twinleaf bot supplied an invalid result to ChooseCardsPrompt` | Native attempt aborted and retained, not a Store-accepted two-card counterexample |

The printed Camping Gear text is **"Search your deck for a card and put it into your hand. Then, shuffle your deck. Your turn ends."** The supplied Advanced Player's Rulebook **H. Deck** explicitly requires unrestricted deck searches for any chosen card to pick the specified number. Thus the zero-card resolution violates the supplied paper rule **even while the pinned native prompt validator reports true**. The pinned source [Camping Gear implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-battle-styles/camping-gear.ts) specifies `{min:0,max:1}` for an unrestricted `SEARCH_DECK_FOR_CARDS_TO_HAND`. The pinned Store's separate `reducePrompt` implementation assigns `action.result` without universally consulting `prompt.validate`; the strict headless wrapper correctly vetoed this specific two-card experiment before Store dispatch. The original strict-preflight arm did not reach the Store. A later identical-source-deal diagnostic disabled that independent preflight and **confirmed direct original-Store acceptance of two physical cards**.

**Opponent and following source turns were explicitly observed:** both baseline and valid-Gear branches proceeded to the opponent's genuine T2 `Fog Crystal` root, opponent `Girafarig` and `Psychic Energy` plays and Pass. On the source's T3, the bot Passed in both branches without an attack. The opponent subsequently used `Full Moon Rondo` on T4, root ordinal 30 in baseline and 34 in valid Gear. Both comparison games remained unfinished at the 50-action cap. This shows actual two-player continuation and also shows why the legal Gear search alone cannot be advertised as a game improvement.

## Independently reproduced Store prompt bypass and compiled guarded A/B

[Default-off guard](../../simulation/twinleaf/agent12-campinggear-prompt-paper-hook.cjs) intercepts **only** source-stamped `Camping Gear BST` `ChooseCardsPrompt` dispatches. It checks own-deck identity, exactly one physically selected card and native prompt validation, before Store dispatch. It never changes the vendor submodule and restores the original `Store.dispatch` descriptor after a run. [Pure tests](../../tests/agent12-campinggear-prompt-paper-hook.test.cjs) cover valid one-card selection, illegal zero/two, wrong zone, unrelated trainer noninterference and descriptor restoration. **Completed compiled real original Store A/B (v5):** manual [CI 41326308904](https://github.com/FlareZ123/experiment-01/actions/runs/41326308904), head `57ab03f20bb74a72dc9635b1d6764c1bda814a8f`, artifact [13091556738](https://github.com/FlareZ123/experiment-01/actions/runs/41326308904/artifacts/13091556738), ZIP SHA-256 `421e0fc01a10006730f6f73dba780074427433cf0d38f0e53ad246a780dbc81f`. The source-dealt matched-start differential retained all native development errors and action caps.

| Original Store treatment | Independent headless strict preflight | Result | Physical source-card search consequence |
| --- | --- | --- | --- |
| Valid one, guard OFF | ON | Accepted, 50 actions capped | One Double Colorless Energy SUM from deck to hand |
| Valid one, guard ON | ON | Accepted, 50 actions capped; **identical complete native root-action SHA** | Same physical card transferred; one native paper-valid audit |
| Paper-invalid zero, guard OFF | ON | **Accepted**, 50 actions capped | Zero transferred, native `validate([])===true` |
| Paper-invalid zero, guard ON | ON | **Vetoed before original Store dispatch**, retained error | No selected card transferred |
| Paper-invalid two, guard OFF | ON | Rejected by headless preflight, before Store | No selected card transferred |
| Paper-invalid two, guard OFF | **OFF** | **Accepted by original Store**, 50 actions capped | Two distinct physical **Iron Thorns ex TWM** cards transferred deck to hand; 46→44 deck, 6→8 hand, despite native `validate([card1,card2])===false` |
| Paper-invalid two, guard ON | **OFF** | **Vetoed before original Store dispatch**, retained error | No selected card transferred |

The two-card branch distinguishes the original Store's `reducePrompt` validation bypass from the separately valid headless preflight veto. The zero-card branch demonstrates a second defect even with native validation running: the printed mandatory count is not represented by the native `min:0`. Both illegal branches are development diagnostics, **not proposals from a competent game-playing policy**.

**Original Store positive noninterference:** guarded valid-one and unguarded valid-one preserved the exact same complete 50-action native root ledger SHA-256 `92f2e6e189cc4dc882d51e259376c20adfa68d60f3cc1af24112e93f9d7dd2b6`, unchanged full initial deal and same native owner physical transfer. The narrow research guard restored its prototype descriptor, accepted the genuine valid answer and vetoed both invalid answers with paper-invalid error receipts. The pure unit suite additionally checks wrong-zone and unrelated trainer noninterference. No default benchmark policy changed. Do not generalize its mandatory-one-card check to every `ChooseCardsPrompt`, because other printed effects permit zero choices.

## Release implications

The frozen two-seat benchmark profile must treat **native prompt acceptance**, **native validator acceptance**, and **printed paper-effect legality** as separate predicates. Here a genuine source-dealt printed Item passes both of the first two predicates with a paper-invalid empty result. A future release-facing prompt ledger should mark such behavior `PROMPT_PAPER_INVALID`, and unexamined families `PROMPT_PAPER_UNVERIFIED`. Require a valid native control unchanged, invalid control veto before original Store mutation, hook restoration and actual two-player continuation before integrating the narrow correction.

This is one source-dealt, retrospective setup window, and neither arm completed a game. The overall benchmark still has **29/32 authenticated source sixties, zero competitively qualified games, no evidence-backed final fixed 60 and no demonstrated 99.5% win rate**.
