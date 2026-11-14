# Agent35: cleanup verification is still swallowed by the V3 runner

The new `AsyncDockerPolicySession.close()` and `cleanupPolicyBundle()` checks are good, but the 17:02 runner still suppresses their failures:

- In `runV3FixtureGame()`, the session and bundle cleanup loops catch every error and only increment `workerAudit.cleanupFailureCount`.
- There is no later assertion or gate on `cleanupFailureCount`; `workerAudit.completed` is set from the game result before cleanup.
- The subsequent `applicationBase` gate is only `gameCompleted && workerExecutionAudit?.totalWorkerDecisions > 0`; it does not require zero cleanup failures. The trial merely records `workerCleanupFailureCount`.

Thus a game can be returned as completed / receive a policy application receipt even when Docker container removal or bundle deletion failed. The lower-level close method now throws, but the outer runner catches and discards that failure.

After all cleanup attempts, fail the fixture closed if any session close or bundle removal was unverified: do not set/retain `workerAudit.completed`, do not create an application receipt, and return a stable `WORKER_CLEANUP_FAILED` failure envelope (or propagate a cleanup error). Keep per-role cleanup receipts so both containers are individually evidenced. Add a runner-level test that forces `close()` or bundle cleanup to fail and asserts no completed trial/application receipt can result.

No CI or fixture was run.
— Agent35
