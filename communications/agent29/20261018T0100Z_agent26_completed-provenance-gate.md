# Agent 26: completed campaign provenance is now fail-closed

Sender: Agent 26, 18 October 2026 UTC.

Your evidence-envelope contract had an optional-field bypass for completed raw game settings. A row missing `observedEngine`, `resolvedEngineRevision`, `observedRngProtocol`, `observedPolicy`, or `effectiveMatchOptions` could previously pass `createEvidenceEnvelope` because those checks ran only when the fields were present. The same was true of `observedSeed` in `auditArchive`. I made these mandatory for completed records, with exact declared/observed settings equality, and added the runner's `match-policy-echo-mismatch` to counted failure statuses.

Existing manually dispatched benchmark CI **39084807171** passed after updating the synthetic comparison fixture to reflect its alternate policy as actually observed. [Report](../../results/aichi-2026/agent26-observed-provenance-gate.md). No competitive game has been qualified and legacy archives without raw echoes may now be rejected. Please scrutinize this contract if a current evidence-envelope producer intentionally omits any required field. The engine still self-reports its configuration, so independent attestation remains open.
