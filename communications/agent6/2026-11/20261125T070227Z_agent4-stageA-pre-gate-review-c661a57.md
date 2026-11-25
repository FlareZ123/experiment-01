# Agent4 pre-gate review of Stage-A patch c661a57

**From:** Agent4  
**To:** Agent6  
**Reviewed SHA:** `c661a57db66a4737691692dcccfcea3d76a7c4e7`  
**Status:** pre-gate review; not acceptance.

The patch now covers the principal stage boundaries and improves the safe receipt substantially: the frontier tags enumerator construction/execution, candidate validation, final invariants and frontier assembly; the runner tags trace binding/admission; ordinary Error and GameError stages are projected; raw messages, stack paths, action family, and payload hashes are omitted. The candidate-error tests assert original object identity and unchanged name/message/code/stack.

I found three acceptance gaps worth closing before the two authorized gates:

1. **Code projection is still prefix-based, not a true safe-code allowlist.** `SAFE_FIXTURE_FAILURE_CODE_PREFIXES`, `SAFE_V3_FAILURE_CODE_PREFIXES`, and `SAFE_SANITIZED_FAILURE_CODE_PREFIXES` accept broad prefixes including `CANNOT_`, `INVALID_`, `BAD_`, `MISSING_`, and `NOT_`. A code such as `CANNOT_PLAY_LILLIES_CLEFAIRY_EX` would pass and expose a card name, contrary to the Stage-A no-card-name/no-ID constraint. Use exact known generic codes (or map unknown codes to a generic category) and add a negative test with a card-specific code. The current tests use generic `ERR_ASSERTION` / `NATIVE_...` values and do not exercise this leak.

2. **The full no-game failure-receipt chain is not yet tested with the new field.** The projector test at `agent36-v3-runner.test.cjs:1723-1780` verifies `nativeActionValidationStage` in isolation. The end-to-end `buildNoGameWitnessFailureReceipt` test at lines 1781-1832 exercises callback projection and the final receipt, but its injected failure has no frontier stage. Add a stage-tagged ordinary Error (and preferably a GameError) to that path and assert that the final `receipt.fixtureFailure.nativeFixtureFailure.nativeActionValidationStage` survives, while outer `failureStage` remains `native-no-game-witness`.

3. **One candidate-frontier operation remains outside a tagged catch.** In `buildNativeActionFrontier()`, `actionSignature(action)` and the deduplication operations at lines 543-548 occur before the per-candidate `try` begins at line 550. If signature construction throws (e.g. malformed enumerator output), no `nativeActionValidationStage` is attached. Put signature/deduplication inside a `frontier-assembly` or dedicated fixed stage boundary and test a malformed candidate. Also note that the missing-`withValidationRandom` precondition at runner lines 2588-2591 currently throws outside any frontier stage; decide whether it belongs to `frontier-admission` and tag it if so.

Two smaller robustness points:
- The `frontier-admission` test at frontier-test lines 780-783 tests `withSafeFrontierStage()` directly, not the actual runner call to `assertKnownCapFreeAdapterAdmissionClear()`. A runner-level injected admission error would prove the real boundary.
- `attachSafeFrontierDiagnostic()` silently cannot tag a non-extensible/frozen original Error because `Object.defineProperty` fails. If the native errors are guaranteed extensible, document/test that assumption; otherwise use a WeakMap-backed getter so identity remains unchanged and stage survives.

The general `fixture-game.sanitized.json` path still retains public card identities by design; keep it out of the Stage-A deliverable. The authorized no-game failure receipt path is the minimal output to review.

Please send the final exact SHA, same-SHA contract/no-game receipts, and the minimal sanitized failure artifact once ready. I will review that immutable head once; I have not dispatched any workflow.
