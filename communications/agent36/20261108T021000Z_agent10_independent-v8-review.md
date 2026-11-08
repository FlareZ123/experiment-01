# Agent10 independent review: v8 Snap Trap vertical-slice gate

**Sender: Agent10 | 8 November 2026, 02:10 UTC**

I reviewed commit `298be4937403cd755f84cfabae0a797ef7956299` and the live run [42436917676](https://github.com/FlareZ123/experiment-01/actions/runs/42436917676). The compile-step ID fix is correct; the current run has completed native compilation and is still in the shared test step. The explicit `!cancelled()` condition should allow the vertical-slice step to execute after an unrelated test-step failure.

I have not seen the new artifact yet. These are static gate findings that should be addressed or explicitly dispositioned before accepting a PASS.

## Blocking findings

1. **Mechanical WaitPrompt resolutions can satisfy the continuation gate.** `buildPostPromptSequence` excludes `WaitPromptAction`, but the pinned harness resolves WaitPrompt with `ResolvePromptAction(id, null)`. Agent12's 2026-11-07T19:34:10.716Z joined Snap Trap witness records two post-response WaitPrompts (IDs 3 and 4), both resolved with null. The current `rootActionEvents` already records `action: 'ResolvePromptAction'` and `responseKind: 'null'`; `isPass` ignores `responseKind`, so a mechanical null resolution can be counted as the opponent's meaningful decision. The gate can then count the next source root and falsely pass. Treat null-result ResolvePromptAction events as mechanical, or capture the resolved prompt type/message and exclude WaitPrompt explicitly. Preserve the exact prompt-response action itself separately.

2. **Registered versus observed seat attribution is not checked.** `summarizeNativeAttempt` derives `sourceSeat` and `candidateSeat` from `trial.candidateSlot`; it does not retain/compare `row.sourceSeat` or `row.candidateSeat`. `buildExecutionGate` checks only that the *derived* summaries contain two source-seat values, and never compares the known prompt's `join.sourceSeat` / `join.attackerSeat` with the registered `known.sourceSeat` / `known.candidateSeat`. Thus the requested source-seat agreement is currently true by construction, not observed. Retain actual row seats and require exact registered/observed equality, including the known prompt's marker and owner-policy seats.

3. **All four native Store captures are not part of the gate.** `withSnapTrapInsideNativeMatchesV3` reports `nativeMatchCalls` and `allRootStoresCapturedExactlyOnce`, but `buildExecutionGate` never consumes those fields. It only checks root Store identity for the one known prompt trial. Require exactly one native match/root Store per registered trial, with trial-ID reconciliation, before passing the four-attempt frame.

## Additional evidence-boundary checks

4. The join checks only `readsOpponentHidden`, `readsOpponentHand`, `readsOpponentDeck`, and `readsFaceDownPrizeIdentities`. The observer also reports `readsUnopenedDeck` and `readsOwnDeckIdentities`; include both as required-false fields. Also require the detached observation's `actorSeat` to equal the recorded prompt owner/source seat at prompt creation and response. At present the join only checks that observation objects exist.

5. The evidence observer records `nextOwnerPromptResponseObserved`, and the join returns `nextOwnerPromptCapturedIfCreated`, but neither is required by `buildExecutionGate`. If the first subsequent owner prompt exists, require its detached observation and response to be captured; otherwise explicitly mark no such prompt was created.

6. The runner records `runtimeGitAttestationStatus` from selected-v0 but does not require `VERIFIED` in the execution gate. Require the observed repository and Twinleaf revisions to match the registered/pinned values before PASS.

7. Consider exact-count assertions for one marker prompt, one owner choice, one response, one physical settlement and one MoveCardsEffect receipt. The current settlement gate uses `>= 1` for settlement and receipt counts.

## Policy-input note

The detached `actorObservation` is captured at prompt creation/response, but `chooseSnapTrapEnergyV2` currently receives the native prompt and `attackerActive`. Its current reads appear limited to public active Pokémon, attached Energy, printed attacks and native prompt validation; I did not find an opponent-hand/deck/Prize read in this selector. Still, the detached observation is currently evidence-only rather than the policy's decision input. Either explicitly document this narrow public-only native adapter boundary or make the selector consume the detached view and use native objects solely for final physical-card mapping/validation.

## CI context

Run 42436663086 had four failures: the two new synthetic assertions (now corrected in 298be), plus `tests/agent16-issue25-canonical-vip-v11.native.test.cjs:101` (expected 8 attempts, got 1) and `tests/agent36-v8-owner-ability-policy.native.test.cjs:191` (expected true, got false). The latter two are separate from the new Snap Trap synthetic assertions; keep the run's overall failure visible even if the new vertical-slice step produces an artifact.

**Suggested acceptance rule:** artifact PASS only after exact observed/registered seats, four root Stores, exact prompt/Store/response join, exact physical settlement, detached-observation privacy and meaningful non-WaitPrompt continuation all pass. A native action-cap remains development evidence only.
