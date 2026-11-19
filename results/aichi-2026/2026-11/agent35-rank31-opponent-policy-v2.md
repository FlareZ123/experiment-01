# Rank-31 Dusknoir / Chimecho opponent policy v2 — V3 worker initialization

**Status:** synthetic integration pass; diagnostic-only, not an attested opponent policy.

## Change

The v1 factory required rank/source/candidate identity keys in runtime `config`. The shared Agent49 V3 worker accepts only `config: {}` and supplies `rng` to the factory.

V2 now:
- accepts opponent role, seat 0 or 1, the exact v2 policy version, an empty config object, and the worker-supplied RNG function;
- keeps rank 31, the exact source-list fingerprint, the fixed Hood Shield Shadow Rider candidate fingerprint, and the Twinleaf pin in immutable module constants and versioned manifests;
- calls the actual worker `validateInit` in the integration regression, passes the accepted envelope plus RNG into `createPolicy`, and rejects non-empty config at both boundaries;
- routes the existing decision tests through `validateInit` before request and decision validation.

## Test evidence

**16/16 passed**, 0 failed, 17 actor-view fixture records. V2's 16 test functions passed in a V8 isolate using `node:test` and `node:assert/strict` shims. The harness executed the actual Agent49 worker `validateInit`, `validateRequest`, and `validateDecision` source plus the actual v2 policy module.

The harness stubbed only the worker's top-level `node:events` and `node:crypto` imports; those imports were not exercised. This was **not** the Node test runner and did **not** start the worker process or perform an IPC handshake.

## Reproducibility

| Artifact | SHA-256 |
|---|---|
| Policy module | `e049bb20b3a802ba1df8250415191754f21850b8dad79e6ca9e43836390cfd9c` |
| Test file | `e42a430fed633f246737a729f5d2de0256e2299b6cd27557a206560190432076` |
| Common constraints | `a8be2e5eb213f27cb852b4126cbaea6b6d1f1b1d1e90efe713b2c9a114abc514` |
| Dependency manifest | `5cb1607b2615037954cfd7ff61d12f249ecc1f7d17768ab2eb3e1530ece26d04` |
| Challenge suite | `ca19f6c75a4bda339f68fd1c77dbf286a30fe735c5f2a836562c960c4d934177` |

Worker: `simulation/evaluation/2026-11/agent49-policy-worker.cjs`, blob `d51ea95c457d61b50a9ee114d342eb17f4350451`, init schema `aichi-policy-worker-init-v2`.

## Evidence boundary

- No worker IPC handshake, native Twinleaf Store receipt, source-natural policy case, native game, matchup result, or win-rate evidence exists for rank 31.
- The policy remains a heuristic prototype; unsupported `MoveDamagePrompt` cases remain fail-closed and all eight held-out cases remain unrun.
- No competitive competence or 99.5% claim is made.

## Next

Agent49 should include this exact v2 module and zero-key init regression in the next legitimate shared policy-bundle acceptance pass. Do not add a workflow, runner, fixture, or game for this correction.
