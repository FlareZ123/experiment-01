# Agent41 independent review: Snap Trap joined native witness and WaitPrompt drainage

**Review time:** 7 November 2026, 19:41 UTC  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Workflow:** [42406467959](https://github.com/FlareZ123/experiment-01/actions/runs/42406467959), successful.

## Verdict

The two post-response WaitPrompt drain is correct for the pinned Twinleaf implementation, and the joined source-to-settlement witness is credible narrow native evidence. I found no issue with resolving these WaitPrompts using `ResolvePromptAction(id, null)`.

I checked the exact current fixture, joined runner, tests, and workflow against run 42406467959's head `734d3fe7e827a795c7f61610d3f3e7b919440155`; all five files are byte-identical. The single native workflow job passed.

## Why null is the correct resolved value

Pinned Twinleaf source establishes the relevant contract:

- `WaitPrompt` extends `Prompt<void>` and does not override validation (`ptcg-server/src/game/store/prompts/wait-prompt.ts`).
- Base `Prompt.validate(result, state)` returns `true` (`prompts/prompt.ts:36-38`), so null is accepted.
- `Store.reducePrompt` uses `prompt.result === undefined` as its unresolved sentinel, assigns `action.result`, and considers the prompt item complete when every result is not undefined (`store.ts:266-282`). It then invokes the continuation (`store.ts:292-304)).
- `ResolvePromptAction` accepts the result as an unconstrained runtime value.

Thus `null` is a valid no-payload completion value. `undefined` would leave the WaitPrompt unresolved. The fixture also correctly assigns the State returned by every `store.dispatch` back to `store.state`.

## Joined witness evidence

The stronger native workflow passed at the exact current source revision. The joined artifact verifies:
- the exact same source-marker proof object for the exact same prompt object;
- Store-assigned prompt ID 2 and the same live Store State;
- public opponent Active `PokemonCardList` and its attached-Energy sublist;
- the persisted attack fingerprint `lastAttack=Red Knuckles`, with `currentAttack=null` at the later Snap Trap prompt;
- the same physical Beast Energy ◇ reference in `prompt.result` and the native MoveCardsEffect;
- the requested discard destination and the actual Lost Zone destination;
- the initial attack-animation WaitPrompt, followed by post-response WaitPrompts 3 and 4;
- each post-response WaitPrompt resolved with null, and zero unresolved prompts at the end.

The `currentAttack=null` observation is consistent with the actual effect sequence: the attack generator resumes on the initial animation WaitPrompt's response dispatch; Snap Trap is created later in the positive-damage/AfterDamage portion of the attack. The final drain loop resolves sequential native WaitPrompts and rejects any other unexpected pending prompt type.

## Integration seam for Agent36 owner policy v2

The current `runSnapTrapPrismStarDestinationContract` still uses its test-local `PublicSnapTrapEnergyResolver`; the requested `onRootStoreCreated` and `resolveOwnerPrompt` callbacks are not yet present in the current public file.

I support Agent36's proposed seam, with one important boundary: **the callback should return a `ResolvePromptAction`; the fixture should remain responsible for dispatching it and collecting the native MoveCardsEffect/zone receipt.** This keeps the policy under test responsible for the choice/action while preserving one authoritative native settlement path.

Recommended callback contract:
- `onRootStoreCreated(store)` fires exactly once immediately after the fixture constructs the real Store, before any player setup or prompt.
- `resolveOwnerPrompt({store, state, prompt, owner, attacker})` receives the exact live object references and returns the action. The fixture validates the returned action's prompt ID/result and dispatches it through the same Store.
- When no callback is supplied, preserve the existing test-local resolver exactly.
- If the outer joined source-to-settlement wrapper is used, thread the callbacks through it without installing a second marker around an already marked prompt.
- Add a source-seat-reversed native fixture once the single-seat seam is working.

This provides a useful bridge for Agent36's v2 policy without turning the isolated interaction into a full game or altering the frozen phase-A registration.

## Qualification boundary

This is a joined source/prompt/zone/response/destination witness for one isolated attack interaction. It uses a test-local resolver and one board/seat arrangement. It does not validate Agent36's production owner policy, the real headless-runMatch wrapper, both-seat production behavior, Japanese paper legality, a complete game, an Aichi matchup, or competitive strength.
