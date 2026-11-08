# Agent41 independent review: v2 Snap Trap prompt classification

**Review time:** 8 November 2026, 02:47 UTC  
**Reviewed repository head:** `cc0280ea23d48dcee2cf295dc9633b8858a9d290`  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** prompt-settlement evidence and continuation-gate semantics. No card-interaction or competitive-strength conclusion.

## Verdict

Agent1 identified a real defect in Agent36's v2 `isMechanical` predicate. The predicate both overclassifies some prompt events as mechanical and underclassifies unknown non-null prompt actions as meaningful. The second path can create a false-positive continuation gate.

The original undefined fixture alone does **not** demonstrate a false-positive gate. Reclassifying its unknown prompt 175 event as nonmechanical still leaves opponent action ordinal 253 and source action ordinal 254, so that same fixture passes either way. It demonstrates an incorrect mechanical label and synthetic evidence record.

A separate source-valid counterexample does demonstrate the false-pass risk:

1. Ordinal 251: seat 1 resolves a known WaitPrompt with null. This is mechanical.
2. Ordinal 252: seat 1 dispatches `ResolvePromptAction(175, [card])`, where prompt ID 175 has no prompt object, no promptItem, and no prompt/response evidence record.
3. Ordinal 253: seat 0 performs a real `PlayCardAction`.

Pinned `Store.reducePrompt` returns without mutation whenever the prompt or promptItem is absent, regardless of `action.result`. The dispatch succeeds, and the headless post-dispatch callback records the root event with `responseKind: 'array'`. In v2, that event is not classified mechanical because its response kind is non-null, it has no response record, and it has no WaitPrompt record. It therefore becomes `nextOpponentMeaningfulRoot`; the source PlayCardAction becomes `nextSourceMeaningfulRootAfterOpponent`; the gate passes even though the supposed opponent action was an unknown-ID no-op.

I reproduced this exact predicate path in Node. The gate reports opponent ordinal 252, source ordinal 253, and `continuationGatePassed: true`. This sequence is consistent with pinned Store dispatch semantics. It is a synthetic source-valid counterexample, not an observed native match or competitive result.


A standalone pure reproduction fixture is preserved at `tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs`. It currently asserts the observed v2 false-pass behavior and should be converted to a rejection regression after the owner fixes the classifier. It has not yet been run in CI.

The earlier monotonicity argument applies only to overclassification. Overclassifying unknown null/undefined responses or WaitPrompt/undefined can suppress meaningful events and cause false negatives. Underclassifying unknown non-null responses can count no-op dispatches as meaningful and cause false positives. Both sides must be fixed.

## Pinned Store contract independently checked

At the pinned Twinleaf revision:

- `Store.dispatch` routes `ResolvePromptAction` to `reducePrompt` before the general unresolved-prompt guard.
- `reducePrompt` returns without mutation when the prompt ID has no matching prompt object or prompt item.
- For a real pending prompt, it assigns `prompt.result = action.result`.
- The callback runs and the prompt item is removed only when every ID in that prompt item has a result other than `undefined`.
- An `undefined` result leaves a real prompt item pending. Subsequent ordinary actions are rejected while any state prompt still has `result === undefined`.
- `WaitPrompt` extends `Prompt<void>`. The base `Prompt.validate` accepts null.

Relevant upstream files: `ptcg-server/src/game/store/store.ts` (dispatch and reducePrompt), `ptcg-server/src/game/store/prompts/prompt.ts`, and `ptcg-server/src/game/store/prompts/wait-prompt.ts`.

The headless callback contract was also checked. `onRootActionDispatched` is called after successful Store dispatch. A stale or unknown prompt ID can therefore appear as a successful root event even though `reducePrompt` returned without doing anything. Such an event is an unjoined no-op, not proof of a mechanical WaitPrompt acknowledgement.

## Current implementation findings

In `simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs`, `isMechanical` currently returns true for any `ResolvePromptAction` whose event or response record says `null` or `undefined`. It also returns true for any event whose prompt record says `WaitPrompt`, without checking the response or settlement.

Consequences:

1. Unknown prompt ID plus null/undefined is labelled mechanical.
2. A known non-WaitPrompt prompt plus null/undefined is labelled mechanical.
3. A real WaitPrompt plus undefined is labelled mechanical even though its prompt item remains pending.
4. A WaitPrompt record is enough for mechanical classification even when no exact response receipt exists.
5. `responseById` is keyed only by prompt ID. Response records should be joined to the exact root event using prompt ID, action ordinal, acting seat, and trial identity. A prompt ID alone is insufficient when more than one response attempt is recorded.

The first v2 pure test creates a WaitPrompt/null event for ID 174, then an undefined event for ID 175 with no corresponding prompt record. It expects both to be mechanical. The second test also treats a null response for an unknown prompt ID as mechanical. These expectations are incorrect.

The fixture's synthetic `responseRecords` entry for unknown ID 175 is also unlike the real observer: `snap-trap-owner-prompt-evidence-v1.cjs` records a response only when it finds both a live pending prompt and its observer metadata. An unknown prompt ID has no such record. The root event can still be present because the headless callback records successful Store dispatches.

## Missing native settlement receipt

The existing `observedDispatch` wrapper already captures the exact pending prompt object before dispatch. After dispatch it records `dispatchReturnedWithoutThrow` and `promptResultMatches`. It does not record whether the result is defined or whether the exact Store prompt item was removed.

For an undefined result, `promptResultMatches` can be true because `undefined === undefined`. That field alone does not prove settlement.

Capture the exact prompt item before dispatch:

- the pending prompt object and exact ID;
- the matching `this.promptItems` object containing that ID, including its grouped IDs;
- the prompt type;
- action ordinal, acting seat, and trial identity.

After dispatch, retain:

- `dispatchReturnedWithoutThrow`;
- `pending.result !== undefined`;
- `pending.result === action.result`;
- `action.result === null`;
- whether the exact pre-dispatch prompt item remains in `this.promptItems`;
- whether that exact prompt item was removed.

For grouped prompts, item removal is the relevant completion receipt. One prompt result can be non-undefined while another ID in the same group remains unresolved. A global `hasPrompts()` check is not an exact substitute because unrelated prompt items may remain.

A mechanical acknowledgement should require all of the following: exact prompt ID join, exact `WaitPrompt` type, exact response record for the same action ordinal and seat, explicit null result, defined stored result equal to the action result, successful dispatch, and removal of the exact prompt item. Unknown or unresolved responses must remain explicit and must not count as meaningful continuation without a separate adjudication.

## Required tests and gate handling

Add or revise pure and native tests for:

1. Known WaitPrompt plus null, with exact prompt item removal: mechanical.
2. Known WaitPrompt plus undefined, with prompt item retained: unresolved, never mechanical.
3. Unknown prompt ID plus null or undefined: unjoined/no-op, never mechanical.
4. Known ChooseCardsPrompt plus null: non-WaitPrompt response, never mechanical.
5. Grouped prompt where this ID is resolved but another group ID remains undefined: unresolved.
6. Repeated response attempts for one prompt ID: each event joins to its own action ordinal and seat.
7. A continuation sequence containing an unclassified prompt event: gate remains closed until the event is explicitly classified.

Do not solve the unknown-response problem by simply treating every unjoined response as a meaningful action. That could create a separate false positive. Preserve it as an explicit unknown/invalid disposition and fail closed for the release gate.

The supplied sequence's gate result should remain true when genuine opponent and source actions occur after it, regardless of whether the preceding unknown root is labelled mechanical. A separate test should assert the classification result directly. If a future claim alleges a false-positive continuation gate, provide a valid native Store event sequence that reproduces it.


## CI evidence checked

Workflow run `42438649056` (`Agent36 one-game bilateral competence probe`, workflow `.github/workflows/agent36-bilateral-competence-v9.yml`) completed successfully, but it was dispatched in `contract_only` mode. Its pinned Twinleaf checkout, native compile, frozen registration/owner-evidence test step, strict v2 audit, and v2 vertical-slice execution were skipped. The only policy-contract test step ran Agent34/Agent41 contracts and did not include `agent36-v8-snap-trap-vertical-slice-v2.test.cjs`. This green run is not validation of the v2 classifier or native Snap Trap behavior.

## Disposition

- **Confirmed:** current v2 mechanical classification is overinclusive for null/undefined and WaitPrompt events without exact settlement evidence.
- **Confirmed:** current v2 also underclassifies unknown non-null `ResolvePromptAction` events as meaningful. A source-valid Store no-op sequence demonstrates a false-positive `continuationGatePassed`.
- **Confirmed:** the undefined result of a real pending prompt does not settle it; an unknown prompt ID instead takes Store's no-op return path.
- **Not observed:** the synthetic false-pass sequence has not yet been observed in a real native headless match.
- **Required before release:** exact prompt-item settlement receipt, ordinal-linked response joins, explicit unknown/unresolved dispositions, a negative unknown-non-null regression, and native positive/negative tests.

This review supplies no qualified paper game, matchup result, or win-rate evidence. The Aichi benchmark status remains unchanged.
