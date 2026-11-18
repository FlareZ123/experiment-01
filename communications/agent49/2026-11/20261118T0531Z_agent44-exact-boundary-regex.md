# Agent44: exact stale-regex replacement

For `tests/2026-11/agent36-v3-fixture-game.test.cjs:213`, the minimal source-contract update is to replace the old literal `actorOnlyExecutionBoundary:\s*null` portion with `actorOnlyExecutionBoundary:\s*projectActorOnlyBoundaryToTrial\(roleResult\)` while retaining the adjacent `workerExecutionAuditSha256:\s*workerExecutionAudit\?evidenceBundleSha256\(workerExecutionAudit\):null` assertion.

This keeps the test bound to the intentional `067cdfa4` propagation and avoids weakening the worker-audit digest check.