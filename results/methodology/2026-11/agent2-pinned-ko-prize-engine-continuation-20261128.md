# Mandatory native KO continuation: pinned source → opt-in host fix

**Agent 2, 2026-11-28.** Research-owned isolated correction. **No native game/CI, frozen V3 policy/fixture, workflow, or candidate deck altered.**

## Failure found in the *actual* pinned game source

The shared `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` presently accepts typed `sourceKind:'engine'` only for the three pre-game messages `GO_FIRST`, `WANT_TO_DRAW_CARDS`, and `CHOOSE_STARTING_POKEMONS`. A prompt with neither a trusted card-effect provenance nor one of those initial-engine messages fails with `PROMPT_SOURCE_PROVENANCE_MISSING`, *before a policy can act*. This limitation is not rank-27-specific.

In pinned `twinleafgg/twinleafgg@a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/effect-reducers/check-effect.ts` **actually generates** after KOs:

- `ChoosePrizePrompt(player.id, CHOOSE_PRIZE_CARD, {isSecret, count, destination})` or `CHOOSE_PRIZE_CARD_TO_DISCARD` for an unusual actor-discard destination. If the awarded count would take all remaining Prizes, or the opponent has no Pokémon left, it auto-takes instead of prompting. Prize selection precedes promotion.
- `ChoosePokemonPrompt(player.id, CHOOSE_NEW_ACTIVE_POKEMON, BOTTOM_PLAYER, [BENCH], {min:1,allowCancel:false})` when the player's Active slot is empty and at least one Bench slot is occupied. The default `max` is 1.

From pinned `state/state.ts`, normal in-game phases are 2–6 or 8, setup is phase 1, and finished is phase 7. From `actions/play-card-action.ts`, `BOTTOM_PLAYER===2` and `BENCH===2`. These exact source-owned mandatory continuation events are missing from main's host source allowlist. Failing to project them prevents the first complete game that reaches such a choice, even if every worker has a correct response.

## A narrow executable correction — **opt-in, not enabled**

On main, `simulation/evaluation/2026-11/agent2-engine-ko-prize-prompt-source.cjs` implements pure `classifyNativeEngineContinuation`. It receives native objects inside the trusted host boundary only. It requires the exact pinned engine revision, a phase in 2–6 or 8, a pending prompt bound to the physical actor/perspective, absence of other card-effect provenance, exact message and constructor, owner-only Bench target/min=max=1 or actor-owned hidden-Prize count/destination, and no forced auto-take/terminal state. It outputs only the existing safe typed source schema: `{classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName}`. No Prize face or native state is published.

The **unmerged opt-in host wiring** is in branch [`agent2/pinned-ko-prize-engine-continuation-20261128`](https://github.com/FlareZ123/experiment-01/tree/agent2/pinned-ko-prize-engine-continuation-20261128), commit `8c243784d24288ab871bb290704aebb03fc5488d`. It passes `allowPinnedKoPrizeEngineSource` into `projectPrompt` / `makeSource`, default **false**, and calls the sidecar only when true. Thus even on that development branch the existing frozen V3 behavior is unchanged until an explicit owner request enables it; main itself is unchanged.

The in-process regression fixtures execute the **actual shared** `projectPrompt`, `validatePrompt`, and `validateDecision` with pinned-class-shaped synthetic State/Prompt structures, across both seats. `tests/2026-11/agent2-engine-ko-prize-prompt-source.test.cjs`: **9/9** groups. Branch-local `tests/2026-11/agent2-pinned-engine-ko-prize-projection.test.cjs`: **6/6** groups, including both-seat host projection → rank27 worker → strict valid token choices, plus hidden Prize sentinel never serialized, wrong owner/cardinality/destination/phase negatives, and default-frozen behavior. The rank27 worker itself now handles **both** `CHOOSE_PRIZE_CARD` and `CHOOSE_PRIZE_CARD_TO_DISCARD`, using native `publicMetadata.requiredCount` and exact public slot ownership (not guessed `minimumCount`), confirmed by its **21/21** source-specific local test groups.

This is code and constructed-observation evidence, **not** compiled pinned Twinleaf, native Store prompt continuation, whole-game execution, decision-policy competence, or a qualified matchup. Real opening/KO/Prize order, exact state phase, provenance hook and dynamic native prompt validation must all be checked on a single owner-authorized same-Store trace before admission. Do not dispatch a fixture or bypass the current owner gate merely because this branch exists.

## Independent prerequisite: pinned card `fullName` is numberless

The same pinned card modules (e.g. `regidrago-vstar.ts`, `net-ball.ts`, `eldegoss-v.ts`) set `fullName` as name+set, not the Aichi exact source's name+set+number. The current `agent36-native-action-frontier.cjs` and `agent36-prompt-projection.cjs` publish this numberless native `fullName`. Rank27's initial exact-printing comparisons would therefore have rejected its real cards. The corrected rank27 worker uses a **collision-checked alias map derived solely from its 37 authentic source entries**, accepting either exact source name+set+number or the unique pinned name+set runtime label; wrong explicit numbers are still rejected. Native source labels alone **cannot prove an exact printing number**—the physical deck installer must do that separately.

## Dependencies and explicit non-overlap

Crispin `AttachEnergyPrompt` for Regidrago already has an Agent47 source-bounded opt-in branch (`agent47/rank13-vsseeker-crispin-endgame-20261128`), and Raihan has an Agent46 successor-branch local projection under review; I did not duplicate either. The existing Eldegoss V RCL entry-lock hook (`simulation/twinleaf/eldegoss-entry-lock-hook.cjs`) also applies when later using the rank27 Net Ball→Eldegoss line. Before any full-game use these separate, pinned-card-specific components must be reconciled with the owner's central V3 adapter and paper Expanded rules.

**Impact:** a narrow path to unblocking *mandatory continuation* for any candidate/opponent with live Prize or KO-selection prompts. **Evidence boundary remains:** 29/32 original source lists, missing ranks 23/25/28; 0/32 qualified benchmark matchups, 0 certified full-game wins and no 99.5% demonstrated rate.