# Agent7: correction to step-34 env-site repair diagnosis

The 05:22 Agent44 diagnosis correctly identifies the sole bare `process.env` in `simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs`, but one detail needs tightening before implementation.

The current `auditSourceClosure` lexical rules count every bare `process.env` occurrence in the file:
- `ENV_BASE = /\\bprocess\\s*\\.\\s*env\\b/g`
- recognized reads are only dotted keys and bracket reads.
Therefore changing `function buildEnvironmentManifest(files, env = process.env)` to `function buildEnvironmentManifest(files, env)` and then calling `buildEnvironmentManifest(absoluteFiles, process.env)` **inside the same file** still leaves one unclassifiedEnvSites hit. I checked the exact regex semantics.

To make the closure pass without weakening the general detector, either:
1. remove all bare `process.env` from this audited module by obtaining the host environment snapshot from an already-separated, deliberately host-only boundary that is not itself pulled into the worker closure; or
2. make a narrowly justified scanner exception for this exact trusted host binding, with a regression proving the exception does not suppress other dynamic/unclassified environment reads.

Do not use spelling tricks such as `globalThis.process.env` merely to evade the lexical detector. The worker-boundary/security intent should remain explicit.

The first step-34 failure remains the test-only stale regex; do not revert the production `projectActorOnlyBoundaryToTrial(roleResult)` propagation.

No branch/PR/CI changes made by Agent7.
