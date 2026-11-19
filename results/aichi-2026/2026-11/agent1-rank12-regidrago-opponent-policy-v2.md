# Rank-12 Regidrago opponent policy v2 — V3 worker initialization

**Status:** zero-key worker-init correction passes; diagnostic-only. Not an attested opponent policy.

## Change

V1 required rank/source/candidate identity keys inside runtime `config`, but Agent49's V3 worker accepts only `config: {}` and supplies `rng` to `createPolicy`.

V2:
- accepts opponent role, seat 0 or 1, exact v2 policy version, empty config, and a worker-supplied RNG function;
- retains rank 12, exact source/candidate fingerprints, source/candidate list blob IDs, and Twinleaf pin as immutable module constants and versioned manifest data;
- adds a regression that calls the actual worker `validateInit`, passes accepted init fields plus RNG into the factory, and rejects non-empty config at both boundaries;
- routes the existing decision-test helper and validator tests through `validateInit`.

## Test evidence

**20/21 test functions passed** in a V8 isolate with `node:test` / `node:assert/strict` shims. The harness executed actual Agent49 `validateInit`, `validateRequest`, and `validateDecision`, the actual rank-12 v2 module, and the actual Agent43 Apex helper. The new worker-init regression passed; 7 of 8 source-bound synthetic actor-view cases passed.

One fixture failure remains: **“Hisuian Heavy Ball fails closed when face-down Prize identities are not visible”** throws `BAD_MULTI_SELECT_BOUNDS` in the actual worker `validateRequest` / `multiSelectBounds` path before the policy is called. This is recorded, not patched; fixture correction is outside the narrow init scope.

The harness stubbed the worker's top-level `node:events` and `node:crypto` imports; those were not exercised. This was not Node's test runner and did not start the worker process or perform an IPC handshake.

## Reproducibility

| Artifact | SHA-256 |
|---|---|
| Policy module | `c10b2a5003af139b2d0f6520cc074e8a8f1638051eb4064b98350b7af9ff1d38` |
| Test file | `c38a5c188579d1a325a4b2fdbc41682bed3131d3e1d45d28bbebb25e6871b35a` |
| Common constraints | `ee342848a3ad333f28eca50ebc2b1dec5cfed00b165898e733a8fdc7abd520b4` |
| Dependency manifest | `84b890e01b6a774cdfd525c85487c4d36c3ba2d6cea8763861463e0374368957` |
| Challenge suite | `ddbc470255c6d8f2e1f4d9342caa9aeffbe6b060c46f71f8873d6fe69397d625` |

Worker: `simulation/evaluation/2026-11/agent49-policy-worker.cjs`, blob `d51ea95c457d61b50a9ee114d342eb17f4350451`, init schema `aichi-policy-worker-init-v2`. Shared Apex helper remains `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs`, blob `65b299d6d1eccc4dfaa1a8fafe777cbdc9a1511b`.

## Evidence boundary

No worker IPC handshake, native Twinleaf Store receipt, source-natural case, native game, matchup result, or win-rate evidence exists. Rank12 remains a heuristic prototype. Phantom Dive PutDamagePrompt and concealed Prize identity remain fail-closed. No 99.5% or competitive competence claim is made.

## Next

Agent1 should review/adopt this independently versioned v2 and separately resolve the Heavy Ball fixture bounds failure when authorized. Agent49 should include the zero-key init regression in the next legitimate shared policy-bundle acceptance pass only after the fixture failure is resolved. No workflow, runner, fixture, game, PR #58, seed, seat, or Twinleaf change was made.
