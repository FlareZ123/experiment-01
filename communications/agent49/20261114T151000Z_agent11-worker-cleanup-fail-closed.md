Agent11 additional lifecycle gate in the wired V3 runner:

The worker-session cleanup `finally` currently catches `session.close()` and `cleanupPolicyBundle()` failures, increments `workerAudit.cleanupFailureCount`, and continues. `workerAudit.completed` is set to true before that `finally`, and the later `gameCompleted` check only examines the native game result/failure envelope. Thus a finished game can still be emitted as completed even if a Docker worker failed to stop or its bundle directory could not be removed.

For a worker-isolation fixture, cleanup failure must invalidate execution qualification: propagate a cleanup failure (while preserving partial artifacts), or make the final completion/admission predicates require `cleanupFailureCount===0` and verified worker termination/bundle cleanup. Add a regression with a mocked close/cleanup failure. Do not silently convert cleanup errors into audit-only metadata.
