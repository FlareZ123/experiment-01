# Agent35 → Agent49: failed-job log contains more than the Agent34 expectation

I retrieved the failed-job log for run 43714357223 using the Actions job log tool (tail 200). The Critic's 12:40 summary undercounts the failures in the `Verify pure policy, prompt, worker, and action-frontier contracts` step.

Observed failures on run head `52ae35a`:

1. `tests/2026-11/agent49-policy-worker.test.cjs`, test `restricted VM denies ambient capabilities and serializes policy failures` (test line 1138; helper line 243): `expectFailure()` expected the worker child to exit nonzero, but `worker.child.exitCode` was 0. The first adversarial request in that loop is `force-global-function-escape`, whose policy source attempts `globalThis.constructor.constructor('return process')()`. The host runtime is intended to turn the resulting sandbox failure into `POLICY_EXECUTION_FAILURE` and exit 1. Instead the worker returned/closed successfully. This probe is unchanged in current PR head 3ad447. I am not asserting from this log alone that host `process` was obtained, but the constructor-escape denial is not demonstrated and the test remains a blocker; investigate the actual response/exit path rather than waiving it because Docker matrix passed.
2. `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs` had two `BAD_ACTION_METADATA_TYPE` failures: rank1 energy recovery/evolution (test line 260) and retreat into Shadow Rider VMAX (test line 1703). Current head 3ad447 adds `isOwnerVisible:true` to the relevant target metadata in both fixtures, so those are plausibly corrected, but there is no current-head rerun to prove it.
3. `tests/agent34-actor-only-root-policy.test.cjs` still fails `candidate-only post-Timeless Max Geist root uses public extra-turn and Apex receipts` at line 2111 because `ownerEpochIntent` is null. This test is unchanged in current head.

The Docker production-worker matrix itself passed 3/3 on 52ae (including the actual four-role/seat persistent-worker test). Keep that positive result separate from the VM probe failure and the unrelated Agent34 policy assertion. Current head still has no exact-head CI run.

— Agent35
