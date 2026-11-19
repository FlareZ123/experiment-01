# Rank-3 policy worker initialization correction — 19 November 2026

## Finding

The shared Agent49 worker's actual `validateInit()` requires an object-valued `config` with exactly zero keys. The rank-3 Snorlax Stall prototype previously required three runtime keys (`rank`, `sourceFingerprint`, `candidateFingerprint`) in `createPolicy()`. Consequently, every initialization message accepted by the worker was rejected by the rank-3 module, while every message accepted by the module was rejected by the worker. The policy was not worker-initializable.

## Correction

- Changed rank-3 `createPolicy()` to accept only the shared empty configuration, while retaining opponent role, seat and policy-version checks.
- Rank, exact source fingerprint and candidate fingerprint remain immutable module constants and manifest bindings; they are no longer runtime configuration.
- Updated the test factory to construct the actual worker init envelope, call the actual exported `validateInit()`, and instantiate the actual rank-3 module using that accepted payload.
- Updated the three direct validator fixtures to use validated zero-key init messages.
- Rebound the dependency manifest and challenge suite to the exact updated file blobs and SHA-256 digests. The manifest now records the actual init schema `aichi-policy-worker-init-v2` and all three executed validators.

## Validation

The deterministic local V8 harness evaluated the actual shared worker source, actual rank-3 policy source and actual test source. **49/49 synthetic tests passed**, including actual `validateInit`, `validateRequest` and `validateDecision` calls. The SHA-256 digests are:

- Policy: `e46b848b325ad30d5ad831df0fd46ec2eddd8db444cce567f41d08ad82a7124b`
- Test suite: `0ef600a84bd862dac3d0439014fd1a691f25970d61374bc1a83c7c2204e0a494`
- Dependency manifest: `a99b9aa0a8db26216cba4ef486d0de0f1191e25535dddd8e6a432fe6a338342d`
- Canonical challenge suite: `e4d1e87b599da07eda6b1a775814c44c6338713f9857b04753e6d85f90e3deaf`

## Limits

This resolves the module/worker init-contract contradiction for rank 3 only. It does **not** prove a worker IPC handshake, load this module through the production `./policy.cjs` loader, insert it into the signed/hash-bound V3 policy bundle, or establish process isolation. The tests remain synthetic; there are zero native Twinleaf games, zero matchup results, no competitive win-rate estimate, and no 99.5% evidence. No deck, rank-1 policy, PR #58, workflow, fixture, seed, seat assignment or Twinleaf revision was changed.

## Exact artifacts

- Policy: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- Tests: `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- Dependency manifest: `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- Challenge suite: `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`
- Shared worker (unchanged): `simulation/evaluation/2026-11/agent49-policy-worker.cjs`
