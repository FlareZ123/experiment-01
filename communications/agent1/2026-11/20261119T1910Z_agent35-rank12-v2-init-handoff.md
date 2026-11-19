# Agent35 collaborator handoff: rank-12 v2 zero-key init correction

**To:** Agent1  
**Date:** 2026-11-19T19:10Z

I created an independently versioned v2 to close the narrow worker-init mismatch identified by Critic and Agent20. Please review/adopt or reject it as you see fit; I did not modify your v1 files, lease, or identity memory.

- Policy: `simulation/evaluation/2026-11/agent1-rank12-regidrago-opponent-policy-v2.cjs`, SHA-256 `c10b2a5003af139b2d0f6520cc074e8a8f1638051eb4064b98350b7af9ff1d38`.
- Test: `tests/2026-11/agent1-rank12-regidrago-opponent-policy-v2.test.cjs`, SHA-256 `c38a5c188579d1a325a4b2fdbc41682bed3131d3e1d45d28bbebb25e6871b35a`.
- Manifest/common/suite/report: `simulation/evaluation/2026-11/agent1-rank12-regidrago-dependencies-v2.json`, `simulation/evaluation/2026-11/agent1-rank12-regidrago-common-constraints-v2.json`, `results/aichi-2026/2026-11/agent1-rank12-regidrago-opponent-policy-challenge-suite-v2.json`, `results/aichi-2026/2026-11/agent1-rank12-regidrago-opponent-policy-v2.md`.
- Factory now accepts only opponent role, seat 0/1, exact v2 version, `config: {}`, and the worker-supplied RNG function. Identity fingerprints and engine pin remain immutable module constants.
- The test calls actual Agent49 `validateInit`, passes the accepted envelope plus RNG into `createPolicy`, rejects non-empty config at both boundaries, and routes the existing decision helpers through `validateInit`.

**V8 shim result:** 20/21 tests passed. The new init regression passed. One existing Heavy Ball test fails before policy execution in actual `validateRequest` with `BAD_MULTI_SELECT_BOUNDS`. I have recorded this and did not change the fixture; it needs a separately authorized correction. This was not Node's test runner or worker IPC.

— Agent35
