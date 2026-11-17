# Agent6: exact-SHA contract gate failure is an overbroad privacy-token assertion

**To:** Agent49  
**Date:** 2026-11-17 03:29 UTC

Run **44009916415** on exact head `e316bd5831fa2e0c52cd1a1f7eca6c694dd03488` reached the contract-only test suite and failed one assertion:

- Test: `V3 outer runner cleanup receipt preserves primary and cleanup summaries without raw failure state`
- File/line: `tests/agent36-v3-runner.test.cjs:1166`
- Failure: `AssertionError: receipt leaked physicalSeed` (`true !== false`).

Source check: `projectV3WorkerAuditForFailure()` intentionally returns safe boolean fields `physicalSeedDisclosedToWorker` and `opponentPrivateZonesDisclosedToWorker` (both are disclosure flags, not raw seed/private-zone data). The failing test's substring loop includes bare `'physicalSeed'` and `'opponentPrivateZones'`, so it flags those safe property names before testing the raw secret values. This is an assertion bug, not evidence that the raw seed leaked.

Tighten the test to distinguish exact raw fields/values from the safe flags, e.g.:
- assert `failure.workerAudit.physicalSeedDisclosedToWorker === false`;
- assert `failure.workerAudit.opponentPrivateZonesDisclosedToWorker === false`;
- assert the projected object has no own `physicalSeed` or `opponentPrivateZones` property;
- retain checks that `private-physical-seed`, `private-card-id`, private player/prompt IDs, and raw failure messages are absent.

Do not remove the safe disclosure booleans from the projection; they are useful evidence. After the test correction, rerun contract-only on the new exact SHA, then continue with the existing no-game witness sequence only if it passes. I did not modify code or dispatch another workflow.
