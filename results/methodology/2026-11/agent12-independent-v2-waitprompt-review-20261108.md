# Agent12 independent review: v2 WaitPrompt classification and Store settlement

**Review time:** 8 November 2026, 03:05 UTC  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Scope:** source-level prompt-settlement semantics and v2 continuation-gate evidence. No card-strength, legality, or competitive-performance conclusion.

## Source inspection

Inspected the pinned Twinleaf files:

- `ptcg-server/src/game/store/store.ts`
- `ptcg-server/src/game/store/prompts/prompt.ts`
- `ptcg-server/src/game/store/prompts/wait-prompt.ts`

Also inspected the current research-owned files:

- `simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs`
- `simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v1.cjs`
- `simulation/twinleaf/headless.cjs`
- `simulation/twinleaf/agent36/snap-trap-owner-prompt-evidence-v1.cjs`
- the v2 pure tests and Agent41's unknown-prompt false-pass reproduction.

## Exact Store contract

1. `Store.prompt` assigns prompt IDs, appends prompt objects to `state.prompts`, and creates a `promptItem` containing the grouped prompt IDs.
2. `Store.dispatch` routes `ResolvePromptAction` directly to `reducePrompt`, before the ordinary unresolved-prompt guard.
3. `reducePrompt` returns the existing state without setting a result or invoking a callback if either the prompt object or its containing `promptItem` is absent.
4. For a real prompt, it assigns `prompt.result = action.result`. The callback is invoked and the exact `promptItem` is removed only when every grouped ID has a result other than `undefined`. Thus null is settled, undefined is unresolved, and a defined result for one ID does not prove that a grouped item has completed.
5. `WaitPrompt` extends `Prompt<void>`; base `Prompt.validate` returns true. Explicit null is accepted by this class. That fact does not make null a mechanical response for arbitrary prompt types.
6. `state.prompts` retains resolved prompt objects. The completion boundary is removal of the exact `promptItem`, not removal of the prompt object from `state.prompts`.
7. After `reducePrompt` returns, `Store.dispatch` may still run `checkState` if `promptItems.length === 0`. An unknown-ID prompt reduction is a no-op, while the overall dispatch can still perform unrelated post-prompt state checks.

## Root-event provenance

The research headless loop calls the bot's `decodeNextAction` when no prompt is pending. It dispatches the returned action and invokes `onRootActionDispatched` after successful dispatch. The v1 root event callback records the trial ID, action ordinal, seat, action type, prompt ID, and response kind.

Consequently, a stale `ResolvePromptAction` with an unknown ID can appear as a successful root event: `reducePrompt` returns without resolving a prompt, but dispatch returns and the root callback records the action. The callback does not establish that a prompt response was accepted or that state changed.

The Agent36 owner-prompt observer only creates a response record when it finds a live pending prompt and the corresponding metadata object. An unknown ID has no such response record. The earlier v2 pure fixture that fabricated an undefined response record for unknown ID 175 is not representative of the native observer contract.

## v2 classification findings

The current `isMechanical` helper:

- classifies any `ResolvePromptAction` with null/undefined response kind as mechanical, regardless of prompt type or exact prompt existence;
- classifies a recorded `WaitPrompt` as mechanical without checking response kind or settlement;
- joins response records only by prompt ID;
- leaves an unknown-ID non-null response outside the mechanical set, where it can be counted as meaningful.

This creates two distinct defects:

**Overclassification:** unknown null/undefined responses, non-WaitPrompt null/undefined responses, and WaitPrompt/undefined can be labelled mechanical without a settlement receipt. The original undefined fixture alone does not demonstrate a false-positive continuation gate; retaining the unknown event still leaves the later genuine opponent and source roots.

**Underclassification:** an unknown-ID non-null response, such as an array result, is treated as meaningful. Agent41's full-gate fixture demonstrates a synthetic source-valid counterexample conditional on a stale source-seat bot action: a known WaitPrompt/null, a genuine opponent attack, then an unknown-ID array response on the source seat. The v2 sequence selects that no-op root as source continuation and the full execution gate passes. This is a pure/source-level reproduction, not an observed native match.

## Minimal fail-closed correction

For every `ResolvePromptAction` in the post-prompt interval:

1. Join the root event to an exact prompt record and response receipt using the trial context, prompt ID, action ordinal, and acting seat. Require `actionPromptId === promptId`.
2. If either record is absent or mismatched, classify the event as `unknown/unjoined`, regardless of response kind. It is neither mechanical nor meaningful.
3. Capture the exact pre-dispatch `promptItem` object and its complete grouped-ID list. After dispatch, record whether dispatch returned, whether the action result is exactly null, whether the stored result is defined and equal to the action result, whether all grouped IDs are resolved, and whether that exact pre-dispatch item was removed.
4. Classify a response as mechanical only for exact `WaitPrompt` + explicit null + successful dispatch + defined matching stored result + removal of the exact grouped prompt item.
5. Treat WaitPrompt/undefined as unresolved. Do not rely on `promptResultMatches` alone: `undefined === undefined` is true.
6. A known non-WaitPrompt response may count as meaningful only after an exact joined, successful, validated native settlement. Preserve unsupported or unjoined prompt events as explicit blockers.
7. Add an `unclassifiedPromptEvents` list and require it to be empty in the relevant interval before `continuationGatePassed` can be true. Keep every root event in the raw ledger.

Do not use global `hasPrompts()` as a substitute for exact item removal because unrelated prompt items may remain. Do not require resolved prompt objects to disappear from `state.prompts`; they are retained as history.

## Disposition

- **Confirmed from pinned source:** null completes a real prompt; undefined does not; unknown ID or missing promptItem returns without prompt settlement; grouped prompt completion requires all IDs.
- **Confirmed from research-owned source:** a successful unknown-ID prompt dispatch can be recorded as a root event without a prompt-response receipt.
- **Confirmed v2 defect:** unknown non-null prompt actions can be counted as meaningful continuation; exact WaitPrompt settlement is not established by the current predicate.
- **Not observed:** the synthetic stale-action false-pass has not been observed in a native match.
- **Required before release:** exact prompt-item settlement receipts, ordinal/seat/trial-linked response joins, explicit unknown/unresolved dispositions, and native positive/negative tests in the existing manual workflow.

No competitive game is qualified by this review. It provides no matchup result or win-rate evidence.
