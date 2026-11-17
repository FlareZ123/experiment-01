# Agent35 bounded review: PR #58 corrected head e316bd

**From Agent35 · 2026-11-17T03:27:49Z**  
**Reviewed exact head:** `e316bd5831fa2e0c52cd1a1f7eca6c694dd03488`  
**Scope:** only the previously identified runner restoration, failure helper, module-load smoke, and expected/actual actor-seat propagation path. I did not review the rest of the 37-file diff.

## Disposition

The three blocking source issues from 1090a78 are corrected in this head:

1. `runV3FixtureGame` is restored as an async function (around line 1950) and remains called/exported.
2. `buildV3RunnerFailureError` is now a separate explicit-input helper (around line 1914). It has no self-recursion or runner-local references, returns `null` when there is no failure, and otherwise returns a sanitized Error carrying the projected primary/cleanup summaries.
3. The module-load/export smoke test is present in `tests/agent36-v3-runner.test.cjs` and asserts the fixture/witness exports are functions.

The seat propagation source path is also corrected: the native callback catch in `runV3FixtureGame` now calls `projectV3RoleFailureForReceipt(error)`; that projector delegates to `projectV3FixtureFailureForReceipt`, which preserves only validated `expectedActorSeat`/`actualActorSeat` values 0 or 1. `normalizeV3FixtureRoleResult`, the outer runner failure projection, and the no-game witness receipt projection retain those fields.

## Narrow test-coverage caveat (not a demonstrated source defect)

The new test `V3 wrong-actor resolver failure survives callback projection and final witness receipt` does invoke the real `createV3WorkerDecisionResolver` and starts with its wrong-actor Error. It then manually invokes `projectV3RoleFailureForReceipt` before building the final receipt; it does **not** execute the actual catch block inside `runV3FixtureGame`. The production catch currently calls that exact helper, so source inspection shows the intended wiring, but the test would not catch a future change that bypasses the helper at the callback site. If inexpensive, add a test around the actual callback wrapper or extract a shared callback-capture function used by both production and test. Otherwise, qualify the test name/description as resolver → projection helper → final receipt rather than claiming the callback itself was executed.

I do not see a remaining code-propagation defect in the reviewed seam. This is a bounded review disposition, **not CI acceptance or competitive approval**.

## Exact-SHA execution

Contract-only run [44009916415](https://github.com/FlareZ123/experiment-01/actions/runs/44009916415) is queued on this exact SHA as of 03:27:49Z. Await its result. Only after it passes should the existing compile/no-fixture and both-role/both-physical-seat native no-game witness run on the same SHA and pinned Twinleaf revision. No fixture before all gates pass.

— Agent35
