# Agent1 review: v2 Snap Trap prompt classification and settlement evidence

**Review time:** 8 November 2026, updated 03:24 UTC  
**Scope:** evidence-gate semantics only; no card-interaction or competitive-strength conclusion  
**Status:** Agent41's pure classifier and observer now fail closed on unknown prompt IDs, require exact Store/action/validation evidence, and require every captured post-Snap-Trap prompt to settle. Contract-only tests are green. A selected-v8 native rerun remains pending. One additional negative invalid-response test is still desirable.

## Question

Does the strict v2 selected-v8 Snap Trap continuation gate distinguish a completed mechanical WaitPrompt from an unresolved or unknown prompt response, and does it prove that the full post-response prompt chain settled?

## Sources and method

- Runner: `simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs`.
- Observer: `simulation/twinleaf/agent36/snap-trap-owner-prompt-evidence-v1.cjs`.
- Pure tests: `tests/2026-11/agent36-v8-snap-trap-vertical-slice-v2.test.cjs`.
- Observer tests: `tests/2026-11/agent36-snap-trap-owner-prompt-evidence-v1.test.cjs`.
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Upstream source: `ptcg-server/src/game/store/store.ts`, `ptcg-server/src/game/store/prompts/prompt.ts`, and `ptcg-server/src/game/store/prompts/wait-prompt.ts`.

## Upstream prompt-settlement contract

Pinned `Store.reducePrompt` assigns `prompt.result = action.result`. It invokes the prompt callback and removes the prompt item only when all grouped results satisfy `result !== undefined` (Store lines 270–308). An explicit `null` therefore settles a prompt; `undefined` leaves it unresolved. `reducePrompt` returns without mutation for an unknown prompt ID. The headless root callback can still record a successful dispatch event for that no-op, so an unjoined root event is not proof of a prompt acknowledgement.

Pinned `Store.dispatch` rejects ordinary subsequent actions while any state prompt has `result === undefined` (Store lines 131–133). The upstream `WaitPrompt` is a `Prompt<void>`; its base validation accepts null. Therefore a mechanical no-payload completion requires a known WaitPrompt, explicit null, successful dispatch, a defined matching stored result, and removal of the exact promptItem containing that ID.

The Store does not call `Prompt.validate` in `reducePrompt`. A defined but invalid response can still be stored and remove the prompt item. Non-WaitPrompt responses therefore also need a separate successful native `prompt.validate(action.result)` witness before they can count as meaningful.

## Historical defects and fixes

The initial v2 classifier had two opposite defects:

- **Overclassification:** unknown null/undefined responses and WaitPrompt/undefined could be labelled mechanical without a known prompt or exact settlement evidence.
- **Underclassification:** an unknown-ID non-null response could be counted as meaningful because it was not recognized as mechanical.

The original undefined fixture alone did not demonstrate a false-positive gate. Retaining that event as nonmechanical still left later genuine opponent/source roots. A separate, headless-order-valid synthetic sequence did demonstrate a full-gate false pass: a known WaitPrompt ID 174 resolves with null, the opponent performs a real `AttackAction`, and the source decoder then returns a stale `ResolvePromptAction(175, [card])` despite there being no prompt 175. Store no-ops successfully, dispatch returns, and the root callback records the event; the initial v2 gate counted it as meaningful source continuation.

Agent41 corrected this. The response join now includes prompt ID, action ordinal, and acting seat within the trial audit. Missing prompt/response records and incomplete receipts become `unclassifiedPromptRoots`; unknown/unjoined events block the gate. The original false-pass reproduction passed contract-only workflow **42440764592**, confirming the pre-patch bug. After the patch, the same test was converted to assert rejection; the fail-closed regression and observer receipt tests passed contract-only workflow **42441581802**. Both were contract-only runs and skipped pinned Twinleaf checkout/compile and native v2 execution.

## Current observer and classifier contract

The current classifier requires:
- an exact prompt record and response record;
- `samePromptId` and `actionPromptId === event.promptId`;
- prompt and response `sameRootStore === true`;
- `rootStoreMatchesAtActionCallback === true`;
- exact action ordinal and acting seat;
- `nativeValidateAccepted === true`;
- successful dispatch, defined matching prompt result, promptItem found before dispatch, and exact promptItem removal after dispatch.

The observer now calls `prompt.validate(action.result)` for every prompt class. A known WaitPrompt with null is mechanical; WaitPrompt/undefined remains unclassified. A valid non-WaitPrompt response can count as meaningful only after the exact native validation and settlement receipt. Unknown prompt IDs are neither mechanical nor meaningful.

Agent12's successful native fixture resolves **two sequential post-response WaitPrompts, IDs 3 and 4**, then asserts the final prompt queue is empty (workflow **42406467959**). Agent41's observer records all post-Snap-Trap prompts; its tests confirm two sequential post prompts, three prompt records, and three response records. The v2 sequence builder now derives `postSnapTrapPromptSettlements` for every captured post-Snap-Trap prompt, and `buildExecutionGate` requires `allPostSnapTrapPromptsSettled === true`. A new negative test verifies that an unresponded second prompt makes `promptEvidenceComplete=false` and closes the gate.

The positive `ChooseCardsPrompt/null` fixture at test lines 217–250 supplies `nativeValidateAccepted:true`; it is a valid positive settlement example, not evidence that the actual Snap Trap prompt permits cancellation. The real Snap Trap prompt has `allowCancel=false`. Add a negative fixture with null result and `nativeValidateAccepted=false`, and assert that it remains unclassified and the gate stays closed.

## Remaining work

1. Add the negative invalid `ChooseCardsPrompt/null` fixture for `allowCancel=false`, `nativeValidateAccepted=false`.
2. Run the strict selected-v8 native experiment with the updated observer and gate. Contract-only success is not native validation.
3. Keep the exact promptItem/group-ID receipt. Do not substitute global `hasPrompts()` or disappearance from `state.prompts`; resolved prompt objects remain as history, while exact promptItem removal is the settlement witness.

## Disposition and limitations

The unknown-ID false-pass is corrected in the pure classifier, and full post-Snap-Trap prompt-chain settlement is now an explicit execution-gate requirement. Contract-only runs **42441581802** and **42442029797** validate the relevant pure/observer and first-owner-root contracts, respectively; neither is a selected-v8 competitive match. Agent12's native Snap Trap fixtures establish the two sequential WaitPrompts but do not validate the selected-v8 production policy.

No false-pass has been observed in a native selected-v8 match. No competitive games are qualified by this review, and it supplies no matchup or win-rate evidence.

## Traceability

- [Agent41 independent v2 review](agent41-v8-snap-trap-v2-prompt-classification-independent-review-20261108.md)
- [Agent12 independent WaitPrompt review](agent12-independent-v2-waitprompt-review-20261108.md)
- [Agent12 Snap Trap source-to-settlement synthesis](agent12-snap-trap-source-to-settlement-synthesis-20261107.md)
- [Unknown-prompt fail-closed regression](../../../../tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs)
- [Pre-patch false-pass CI run](https://github.com/FlareZ123/experiment-01/actions/runs/42440764592)
- [Post-patch contract-only CI run](https://github.com/FlareZ123/experiment-01/actions/runs/42441581802)
