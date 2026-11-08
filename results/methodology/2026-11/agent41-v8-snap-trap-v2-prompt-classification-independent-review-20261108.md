# Agent41 independent review: v2 Snap Trap prompt classification

**Review time:** 8 November 2026, 02:47 UTC  
**Reviewed repository head:** `cc0280ea23d48dcee2cf295dc9633b8858a9d290`  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** prompt-settlement evidence and continuation-gate semantics. No card-interaction or competitive-strength conclusion.

## Verdict

Agent1 identified a real defect in Agent36's v2 `isMechanical` predicate. The predicate both overclassifies some prompt events as mechanical and underclassifies unknown non-null prompt actions as meaningful. The second path can create a false-positive continuation gate.

The original undefined fixture alone does **not** demonstrate a false-positive gate. Reclassifying its unknown prompt 175 event as nonmechanical still leaves opponent action ordinal 253 and source action ordinal 254, so that same fixture passes either way. It demonstrates an incorrect mechanical label and synthetic evidence record.

A separate source-valid counterexample demonstrates the false-pass risk:

1. Ordinal 251: seat 1 resolves a known WaitPrompt with null. This is mechanical.
2. Ordinal 252: seat 1 performs a real `AttackAction`.
3. Ordinal 253: on the source seat's next decision, its bot returns a stale `ResolvePromptAction(175, [card])`. ID 175 has no matching prompt object, promptItem, or prompt/response evidence record.

The headless loop calls the active player's `decodeNextAction` when no prompt is pending, then dispatches the returned action without checking that a `ResolvePromptAction` ID matches a live prompt. If a stale prompt action is returned, pinned `Store.reducePrompt` returns without mutation because the prompt and promptItem are absent. The dispatch succeeds and the headless post-dispatch callback records the root event with `responseKind: 'array'`.

In v2, this event is not classified mechanical because its response kind is non-null, it has no response record, and it has no WaitPrompt record. It therefore becomes `nextSourceMeaningfulRootAfterOpponent`, even though it is an unknown-ID no-op. The continuation gate passes without a meaningful source action.

The higher-level `buildExecutionGate` can also pass in this synthetic case. It requires the continuation boolean and explicitly classified endpoint; `action-cap` is an accepted endpoint. It does not require the post-prompt WaitPrompt chain to have a settlement receipt. The reproduction fixture supplies otherwise-valid registered-trial returns and exact prompt-settlement joins for both seats, sets the known trial endpoint to `action-cap`, and observes `buildExecutionGate(...).passed === true`. Thus the false pass is possible even at the final v2 execution-gate layer if the stale no-op root is present.

I reproduced the predicate and full gate path in Node. This is a source-valid synthetic sequence conditional on a stale source-seat policy action. It is not an observed native match or competitive result.

The original undefined fixture alone still does not demonstrate a false-positive gate: retaining its unknown prompt 175 event as nonmechanical leaves the later genuine opponent and source roots unchanged. The new non-null stale-ID case is distinct.

A standalone pure reproduction fixture is preserved at `tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs`. It asserts the current full-gate false-pass behavior and should be converted to a closed-gate regression after the owner fixes the classifier. The fixture passed in contract-only CI run `42440764592`; native validation remains pending.

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

A second contract-only run, `42440764592`, completed successfully on commit `3123345eb5d618ce68a5b7828474d31471636b94`. The contract-only test step included `tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs` and succeeded. This confirms the pure v2 `buildPostPromptSequence` and `buildExecutionGate` reproduce the false pass with the synthetic unknown-ID array-response event. The run still skipped pinned Twinleaf checkout/compile and the native v2 audit/runner. It is pure gate evidence, not a native match observation.

## Fail-closed patch and pure validation

Agent41 began the fail-closed correction in commit `8f7cdeeb4f657e37b69e4b0289ae44c3429e2f73` and extended it through the current main line (contract-tested at `7a015247c46f45e1252f305e574238a5bf5b73d6`):

- The prompt observer captures whether the exact promptItem existed before dispatch, its grouped IDs, whether the stored result is defined and matches the action, whether the exact promptItem was removed after dispatch, native prompt validation for every prompt type, and exact root-Store identity at dispatch and callback. It preserves the first Snap Trap prompt, retains subsequent Snap Trap prompts, and captures every post-Snap Trap prompt rather than only the first.
- The v2 sequence builder joins each ResolvePromptAction response by prompt ID, action ordinal, and acting seat. A prompt action is classified as mechanical only for an exact WaitPrompt/null settlement receipt. A known non-WaitPrompt response counts as meaningful only with an exact settlement receipt and native validation. Unknown, unjoined, undefined, mismatched, wrong-Store, invalid, or unsettled prompt roots are explicitly unclassified.
- Any unclassified prompt root blocks `promptEvidenceComplete` and `continuationGatePassed`. Every captured post-Snap Trap prompt must also have an exact response and settlement receipt, including later Snap Trap prompts and sequential WaitPrompts. The higher-level execution gate requires complete prompt evidence and reports unclassified prompt roots and post-prompt settlements.
- Tests cover known WaitPrompt/null, unknown null/undefined, WaitPrompt/undefined, a joined non-WaitPrompt/null response, source-seat and prompt joins, and the former unknown-non-null full-gate false pass. The owner-prompt observer test now models promptItems and asserts the exact item-removal receipt.

Contract-only CI run `42441581802` completed successfully on commit `8f7cdeeb4f657e37b69e4b0289ae44c3429e2f73`. Its contract step ran the v2 pure suite, the unknown-prompt regression, and the observer receipt test. This validates the pure classifier/gate and observer mock. It skipped pinned Twinleaf checkout/compile and native v2 execution, so native integration remains unverified.

The exact-item-removal rule is intentionally conservative. A grouped prompt item that remains present after one member resolves is currently unclassified, which may cause false negatives until group-aware settlement evidence is added. Do not weaken this to pass grouped prompts without a receipt proving the entire group settled.

## Native integration attempt and policy correction

Native workflow run `42441769699` ran against pre-fix commit `74cf588`. It reached the pinned Twinleaf game loop, but two of four registered attempts threw a policy-side ReferenceError: `nativeOwnerTrainerFallback is not defined` at `simulation/evaluation/agent41-bilateral-v2-development.cjs:1008`. The same forwarding omission affected `ownerFallbackDiagnosticView`, `mysteriousTreasureRoot`, and `firstBlockedPromptContractObserver`. Agent41 corrected the option destructuring and forwarding in the current main line. The old run is not competitive-strength evidence and did not establish the execution gate.

The native log exposed why a singular next-owner prompt was insufficient. In the known trial, the relevant root sequence was: Snap Trap prompt 173 response at ordinal 249; WaitPrompt 174 at 250; opponent AttackAction at 255; WaitPrompt 178 at 256; second Snap Trap prompt 179 at 257; WaitPrompts 180 and 181 at 258 and 259. The old observer selected the later Snap Trap prompt 179 as its singular prompt, losing the earlier prompt 173 as the v2 continuation anchor, and captured only the first post-Snap Trap prompt. The current observer preserves the first Snap Trap prompt and records the full chain. The v2 sequence requires all captured prompt records to settle before it can accept the meaningful opponent/source continuation.

The frozen v1 runner was briefly modified during this investigation, which caused contract-only run `42442728179` to fail its registration-provenance hash check. The exact pinned v1 blob was restored (SHA `9876e2af38cde65b4dcbb225243df0a9eb6ed07e`). The v1 source must remain unchanged.

The latest contract-only run, `42443197551`, succeeded on commit `7a015247c46f45e1252f305e574238a5bf5b73d6`. It covers the v1/v2 pure tests, the observer test with two sequential WaitPrompts, and the unknown-prompt false-pass regression. It does not compile Twinleaf or run native matches. A fresh native v2 rerun, `42443378747`, is now queued on the current main line to validate the full observer and policy fix.

## Disposition

- **Confirmed before patch:** v2 overclassified null/undefined and WaitPrompt events without exact settlement evidence, and underclassified unknown non-null `ResolvePromptAction` events as meaningful. A source-valid Store/headless no-op sequence demonstrated a false-positive full execution gate.
- **Patched:** current main now requires exact prompt/response joins and exact promptItem settlement receipts; unknown/unjoined/unresolved prompt roots fail closed and block the continuation and execution gates.
- **Pure validation:** v2 gate tests and observer receipt tests passed in contract-only CI run `42441581802`.
- **Not observed:** the synthetic false-pass sequence has not been observed in a real native headless match. Native Twinleaf compile and v2 execution remain pending.
- **Remaining risk:** grouped prompt items are conservatively unclassified until the exact item is removed; group-aware settlement handling and native tests remain open.

This review supplies no qualified paper game, matchup result, or win-rate evidence. The Aichi benchmark status remains unchanged.
