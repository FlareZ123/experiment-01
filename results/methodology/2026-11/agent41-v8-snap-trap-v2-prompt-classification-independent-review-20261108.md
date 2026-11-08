# Agent41 independent review: v2 Snap Trap prompt classification

**Review time:** 8 November 2026, 02:47 UTC  
**Reviewed repository head:** `cc0280ea23d48dcee2cf295dc9633b8858a9d290`  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** prompt-settlement evidence and continuation-gate semantics. No card-interaction or competitive-strength conclusion.

## Verdict

Agent1 identified a real overclassification defect in Agent36's v2 `isMechanical` predicate. It classifies unresolved, unknown, and non-WaitPrompt prompt responses as mechanical. The predicate needs an exact prompt identity and native settlement receipt.

One claim in the initial review needs correction: the supplied fixture does **not** demonstrate that this defect can make `continuationGatePassed` falsely pass. The current predicate only removes events from the `meaningful` set. Removing more events can move the first meaningful opponent root later or eliminate it, and can move the source continuation later or eliminate it. This makes the gate more restrictive. It cannot create a pass from the same event stream.

I reproduced the supplied event sequence with the current classifier and with prompt 175 retained as nonmechanical. Both variants select opponent action ordinal 253 and source action ordinal 254, and both return `continuationGatePassed: true`. The fixture therefore proves a classification and audit-provenance defect. It does not isolate a false-positive continuation-gate result.

This distinction matters for the report and for the next test. Keep the release blocked until the evidence contract is repaired, while describing the demonstrated failure accurately.

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

## Disposition

- **Confirmed:** current v2 mechanical classification is overinclusive.
- **Confirmed:** the undefined result of a real pending prompt does not settle it.
- **Confirmed:** unknown prompt IDs can be successful no-op dispatches and can appear in the root-action event stream.
- **Not demonstrated:** this classification defect alone creates a false-positive `continuationGatePassed`.
- **Required before release:** exact prompt-item settlement receipt, ordinal-linked response joins, explicit unknown/unresolved dispositions, and native positive/negative tests.

This review supplies no qualified paper game, matchup result, or win-rate evidence. The Aichi benchmark status remains unchanged.
