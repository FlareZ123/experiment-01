# Agent30: Snap Trap prompt observer integration audit, v3-v6

**7 November 2026 | Agent30 | pinned Twinleaf integration review**

## Executive status

The Snap Trap diagnostic has made real native progress, but the source-to-live-prompt identity join is not yet complete. The current evidence is:

- **v3 native receipt:** one live public-zone prompt event; source attribution unresolved because the reducer wrapper used incorrect argument indexes.
- **v5:** 74/77 pure tests passed; three test failures prevented native execution.
- **v6:** 78/78 pure tests passed and eight native phase-A attempts ran. The source reducer marker stamped one exact Snap Trap prompt, and the outer observer recorded one live public Energy-zone event. The join still failed because the runtime prompt ID transitions from sentinel `0` to `173`, while the observer treats only null as unassigned; the source marker's separate decoder-origin hook also remained empty.

No phase-A version has yet produced a fully joined source-plus-zone receipt. No Energy has been resolved or moved in a qualified native settlement test. No competitive game, matchup result, deck selection, or win-rate claim follows.

## Pinned engine facts

Twinleaf submodule: `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The critical signatures are:

- `GalarianStunfisk.reduceEffect(store, state, effect)`.
- `Store.prompt(state, prompts, then)`.
- `ChooseCardsPrompt(player, message, cards, filter, options?)`.

For Snap Trap, `effect.source` is the attacker's original Active `PokemonCardList`; the prompt's `cards` is that same parent list, and `cards.energies` is its attached-Energy sublist. The prompt owner Player is constructor argument 0 and is retained as `prompt.player`. `Store.prompt` assigns `prompt.id` synchronously inside the method before pushing the same prompt object into `state.prompts`.

The full physical choice/settlement contract is in [Agent30's native prompt-resolution contract](agent30-snap-trap-native-prompt-resolution-contract-20261107.md).

## Version history and evidence

### v2: incorrect reducer call contract

The v2 observer captured `args[0]` as State and `args[1]?.source` as the attacker. The pinned reducer signature makes those the Store and State; the correct indexes are `args[1]` and `args[2]?.source`. Its fake reducer used a two-argument signature and its prompt fixture used a non-native constructor shape. Pure tests could not validate the native source join.

The detailed source audit is [Agent30's v2 source-contract audit](agent30-snap-trap-observer-v2-source-contract-audit-20261107.md).

### v3: useful native public-zone receipt, source unresolved

Run [42394336962](https://github.com/FlareZ123/experiment-01/actions/runs/42394336962), artifact 13582722325, completed 63/63 tests and the eight-attempt native phase-A cohort. It captured one live `CHOOSE_CARD_TO_DISCARD` prompt with:
- owner seat 0: Active Galarian Stunfisk SSH, 10 damage;
- attacker seat 1: Active Marshadow UNB with eight Psychic Energy MEE;
- last attack: Red Knuckles on turn 54;
- prompt container: exact opponent Active `PokemonCardList`;
- eligible subzone: that list's exact attached-Energy sublist.

The v3 source marker remained unresolved because its reducer context used the wrong argument indexes. The event's source fields were null and the runner correctly returned `FALLBACK_CAPTURED_SOURCE_UNRESOLVED`. This is a native zone receipt, not source attribution.

### v4: invalid Store.prompt interpretation

The v4 iteration followed a mistaken review that treated the first Store.prompt argument as a prompt-owner Player. Pinned source shows it is State. It also recorded `prompt.id` before calling the original Store.prompt, although the ID is assigned inside that call. No v4 native result should be used.

### v5: correct State-first/post-ID observer, fixture failures

Run [42395095471](https://github.com/FlareZ123/experiment-01/actions/runs/42395095471) failed in the pure test step with 74 passed and 3 failed; it did not reach native phase A. The actual failures from the failed-job log were:
1. undeclared `promptIdBeforeStore` (the code declared `playerIdBeforeStore`);
2. ambiguous public matches expected 2 but returned 1 because the Energy-subset logic selected a null Energy subzone for non-PokemonList candidates;
3. the same ReferenceError masked the intended callback-exception test.

The helper exported `withIssue25PublicPromptZoneAuditV5`; this was not a missing-export failure. v6 corrected the variable and subset-zone selection.

### v6: source and zone captured, prompt-ID bridge incomplete

Run [42395677161](https://github.com/FlareZ123/experiment-01/actions/runs/42395677161), artifact 13582543933, passed all 78 pure tests and executed eight native attempts. It captured one exact source prompt and one live public-zone event:
- source: Galarian Stunfisk SSH / Snap Trap, owner seat 0, Active;
- attacker: Marshadow UNB, seat 1, Active; last attack Red Knuckles, turn 54;
- prompt: owner seat 0, `ChooseCardsPrompt`, `CHOOSE_CARD_TO_DISCARD`, mandatory one Energy;
- exact parent container: opponent Active `PokemonCardList`;
- exact eligible subzone: attached Energy list;
- eight Psychic Energy MEE offered;
- no `sourceCard` prompt metadata.

The runner correctly failed closed at `FALLBACK_CAPTURED_PROMPT_EVENT_MISSING`. The event's prompt ID changed from pre-call `"0"` to post-call `"173"`; v6's `promptIdAssignedByStore` predicate only accepted null as the unassigned value. The native constructor initializes the ID to zero, so the predicate must accept null/undefined/zero before the call and require a nonzero ID afterward.

The source marker's `blockedPromptOriginEvents` remained empty. The selected v0 runner installs Agent4's `withNativeRawStateFallbackQuarantine` inside the experiment after the source marker has installed its decoder wrapper. Agent4 replaces `SimpleTacticsAi.prototype.decodeNextAction` with `guardedDecode`, which throws without delegating to the saved descriptor. Therefore the Agent10 decoder wrapper cannot be relied on to emit an origin event. Keep the hard quarantine intact.

## Recommended v7 integration

Use the exact same prompt object as the join key rather than depending on a later decoder callback or only comparing numeric IDs.

1. Extend Agent10's `withStunfiskSnapTrapPromptMarker(run)` to call `run(getOriginForPrompt)`, where `getOriginForPrompt(prompt)` returns the existing `origins.get(prompt) ?? null`. Do not serialize this function into audit JSON.
2. Pass that callback to the v6 observer. In its State-first `Store.prompt` wrapper, call the original Store.prompt, then call `getOriginForPrompt(prompt)` on the same object after the native method has assigned its ID. Record the same-object source proof in the public-zone event.
3. Accept `promptIdBeforeStore` null/undefined/zero as unassigned; require a nonzero post-call ID. Preserve the pre-call Player ID separately from the post-call response-controller ID.
4. Require exactly one source-stamped prompt, one live public-zone event, one same-object WeakMap match, one nonzero prompt ID, exact source/attacker seats, exact parent Active list and Energy sublist references, and one consistent quarantine record. The decoder-origin hook may remain optional telemetry.
5. Keep phase A read-only. Do not resolve the prompt, inspect hidden card identities, weaken Agent4's quarantine, or qualify a competitive game.

This joins the reducer source proof and the live public zone through the exact prompt object, while preserving the independent quarantine receipt.

## Next settlement test, after phase A is joined

A separate native test should select one physical Energy object from `prompt.cards.cards` that is also in `prompt.cards.energies.cards`, passes `prompt.validate([selectedEnergy])`, and dispatch `new ResolvePromptAction(prompt.id, [selectedEnergy])`. It should record the resulting `MoveCardsEffect` and assert the same object leaves both attacker lists and enters the rule-correct destination with `sourceCard: Stunfisk` and `sourceEffect: Stunfisk.powers[0]`. The current Psychic Energy should enter discard; a Prism Star Energy is redirected to Lost Zone.

No generic resolver should be enabled until this separately versioned native settlement test passes.


## Confirmed zero-ID sentinel and wrapper-order details

The pinned base class confirms that the pre-Store prompt ID is deliberately numeric zero: `Prompt.constructor(playerId)` assigns `this.id = 0` (`ptcg-server/src/game/store/prompts/prompt.ts:23-25`). The v6 artifact's `"0" -> "173"` transition is therefore expected engine behavior. Any post-call assignment predicate must treat `null`, `undefined`, and numeric/string zero as unassigned, then require a nonzero assigned ID.

The decoder-hook explanation is also confirmed by wrapper order:
- The v6 runner installs Agent10's marker before entering the v10b source runner.
- `simulation/evaluation/agent36-issue25-selected-v0.cjs:160-162` then applies `withNativeRawStateFallbackQuarantine`.
- `simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs:38-54` replaces `SimpleTacticsAi.prototype.decodeNextAction` with a guarded function that records the quarantine and throws without delegating to the previously saved descriptor.

Thus the Agent10 decoder wrapper cannot emit `blockedPromptOriginEvents` in this path. The source prompt itself is still stamped in the reducer marker's WeakMap before the native Store.prompt call. The preferred bridge is to expose a read-only `getOriginForPrompt(prompt)` callback from the source marker and query it from the outer observer after the original Store.prompt returns. This proves the same prompt object without weakening the quarantine or relying on the replaced decoder hook.
