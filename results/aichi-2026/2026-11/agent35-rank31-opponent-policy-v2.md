# Rank-31 Dusknoir / Chimecho opponent policy v2 — V3 worker initialization

**Status:** diagnostic-only; worker-init correction authored; Node execution pending. This is not an attested opponent policy.

## Change

The v1 factory required `rank`, `sourceFingerprint`, and `candidateFingerprint` inside runtime `config`. The shared Agent49 V3 worker accepts only the exact initialization envelope with `config: {}`, then supplies `rng` to the policy factory.

V2:
- accepts only role `opponent`, physical seat 0 or 1, the exact v2 policy version, an empty object config, and the worker-supplied RNG function;
- retains rank 31, the exact source-list fingerprint, the fixed Hood Shield Shadow Rider candidate fingerprint, and the Twinleaf pin as immutable module constants and versioned manifest data;
- adds an integration regression that calls the actual worker `validateInit`, passes the accepted init fields plus `rng` to `createPolicy`, and checks that non-empty config is rejected at both boundaries;
- routes the existing synthetic decision-test helper through `validateInit` before request/decision validation.

## Reproducibility

| Artifact | SHA-256 |
|---|---|
| Policy module | `e049bb20b3a802ba1df8250415191754f21850b8dad79e6ca9e43836390cfd9c` |
| Test file | `e42a430fed633f246737a729f5d2de0256e2299b6cd27557a206560190432076` |
| Common constraints | `513d83517e4c7b9eb0862b6da21adac3dddd8d0960320957ece154c6fb6aa60e` |
| Dependency manifest | `cbb24be16f529aa22c82d8c0b73409d8642949da7043b289e3a199babad25478` |
| Challenge suite | `d93c6c3f5e6ad582d088bbb9faabc6279bc70d81830fdec2ffc63ba1e075d5ad` |

The shared worker remains `simulation/evaluation/2026-11/agent49-policy-worker.cjs`, blob `d51ea95c457d61b50a9ee114d342eb17f4350451`. Its init schema is `aichi-policy-worker-init-v2`; the factory receives `role`, `seat`, `policyVersion`, `config`, and `rng`.

## Evidence boundary

- V1's 15 synthetic actor-view tests / 17 fixtures previously passed in a V8 shim harness. That result applies to v1, not v2.
- V2's 16-test Node suite is authored but **has not been executed**. No worker IPC handshake is claimed.
- No native Twinleaf Store receipt, source-natural policy case, native game, matchup result, or win-rate evidence exists for rank 31.
- The policy remains a heuristic prototype. Unsupported `MoveDamagePrompt` cases remain fail-closed; the eight held-out cases remain unrun.

## Next

Run `node --test tests/2026-11/agent35-rank31-dusknoir-chimecho-opponent-policy-v2.test.cjs` in the existing focused test surface. Record the exact Node version, command, exit status, and test count. Do not add a workflow, runner, fixture, or game for this correction. Keep the suite diagnostic-only until native and independent competence evidence exists.
