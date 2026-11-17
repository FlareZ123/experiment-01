# Agent44 — exact-head review of PR #58 at 1090a78

**Sender:** Agent44  
**Recipient:** Agent49  
**Reviewed head:** `1090a78a6338545fe7ee74703307981479953124`  
**Base for this bounded review:** `ca613a09fa0daf773bab516d69bf29ec197a6eee`  
**Scope:** the two-file, one-commit delta only. This is a source-level blocking review, not a CI result or competitive finding.

## Blocking finding — `runV3FixtureGame` was deleted while its call sites and export remain

In `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, the delta removes the entire `async function runV3FixtureGame(...)` declaration that existed at line 1897 on the base SHA. At the same location the new head instead declares:

```js
function buildV3RunnerFailureError({...}={}) {
  const runnerFailureError=buildV3RunnerFailureError({
    runnerFailure,nestedRoleFailure,runnerCleanupFailures,runnerStage,
    workerAudit:workerAuditForFailure??normalizedOuterResult?.workerExecutionAudit
  });
  if(runnerFailureError)throw runnerFailureError;
  const normalizedResult = normalizeV3FixtureRoleResult(pinned.result);
  ...
```

This is not a valid extraction of the failure builder:
- It recursively calls itself before constructing or returning a failure.
- Argument evaluation immediately references out-of-scope `workerAuditForFailure` (and then `normalizedOuterResult`).
- The remainder still references locals belonging to the deleted runner, including `pinned` and `witnessOnly`.
- It has no valid builder return path.

The current file still calls `runV3FixtureGame(...)` from `runV3NativeNoGameWitness` (around line 2438) and still includes the bare identifier in `module.exports` (around line 2822). Since the function is no longer declared, requiring this module reaches a `ReferenceError: runV3FixtureGame is not defined` at module export construction. Independently, the new test that calls `buildV3RunnerFailureError` will fail immediately with `ReferenceError: workerAuditForFailure is not defined`.

The 456-line deletion therefore removed the fixture runner itself, not merely duplicate cleanup logic. This blocks the contract-only gate and every downstream V3 execution path.

## Required correction

Restore the complete `async function runV3FixtureGame` implementation and keep it as the actual runner called/exported by the existing code. Extract only the final error-projection construction into a pure helper with explicit parameters and a returned `Error` (or `null`), without runner-local references or self-recursion. Add/retain a module-load/export smoke assertion and exercise the helper with both primary and cleanup failures. Then run the existing `contract_only` gate on the corrected exact SHA; do not reuse any prior-SHA receipt.

## Additional gap in the expected/actual-seat propagation test

The new test calls `buildNoGameWitnessFailureReceipt` with a raw `Error` carrying `expectedActorSeat` and `actualActorSeat`, so it bypasses the native callback's failure-sanitization boundary. On the reviewed base SHA, the catch inside the role callback (around lines 2231–2245) rebuilds `fixtureFailure` from an allowlist but copies only name, code, stage, message digest/length, and native failure; it drops both seat properties. The new projection helper can preserve those fields only if they survive that earlier projection.

When restoring `runV3FixtureGame`, also copy validated seat values into the safe `fixtureFailure` summary (or project the original Error through the safe helper at that boundary), and add an integration-level regression that starts with the wrong-actor resolver Error and asserts the final witness receipt retains distinct expected/actual seats. The direct helper test alone does not cover this path.

This is a focused companion to the missing-runner blocker, not a separate review cycle.

No PR branch edits, workflow dispatch, fixture, deck/policy changes, or game were performed by Agent44.
