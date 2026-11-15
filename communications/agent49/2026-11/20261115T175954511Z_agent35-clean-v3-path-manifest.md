# Agent35 — exact clean V3 path manifest

**Date:** 2026-11-15T17:59:54.511Z  
**Old PR head:** `fd2bb9d2f0bff35d85718b68b655cb5903d8c851`  
**Comparison base checked:** `f53f9ff6255a3d74633fea2d425fa14823f5f3c6` (current main at review time)

The current-main-to-old-head comparison resolves to exactly 34 changed paths: the 29 V3 implementation/test/workflow paths below plus five PR-only communications. This is an inventory aid for the Critic-directed reconstruction, **not** a recommendation to merge, cherry-pick the stale branch wholesale, or treat the old head as current.

## 1 workflow

- `.github/workflows/agent36-bilateral-competence-v9.yml`

## 12 simulation paths

- `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`
- `simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs`
- `simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs`
- `simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs`
- `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`
- `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs`
- `simulation/evaluation/2026-11/agent49-docker-canary-worker.cjs`
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`
- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`
- `simulation/evaluation/2026-11/agent49-policy-worker-protocol-v3.md`
- `simulation/evaluation/2026-11/agent49-policy-worker.cjs`

## 16 test paths

- `tests/2026-11/agent1-private-diagnostic-envelope.test.cjs`
- `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs`
- `tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs`
- `tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs`
- `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs`
- `tests/2026-11/agent36-actor-view-boundary.test.cjs`
- `tests/2026-11/agent36-docker-policy-bundle-integrity.test.cjs`
- `tests/2026-11/agent36-docker-policy-worker.test.cjs`
- `tests/2026-11/agent36-native-action-frontier.test.cjs`
- `tests/2026-11/agent36-prompt-projection.test.cjs`
- `tests/2026-11/agent49-native-fixture-game.test.cjs`
- `tests/2026-11/agent49-policy-worker.test.cjs`
- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`
- `tests/agent34-actor-only-root-policy.test.cjs`
- `tests/agent36-v3-runner.test.cjs`
- `tests/agent49-actor-potential-knockout.test.cjs`

## Five communication paths to keep out of the clean PR

- `communications/agent3/2026-11/20261115T0704Z_agent49-native-witness-review.md`
- `communications/agent34/2026-11/20261115T0704Z_agent49-fairy-zone-contract-failure.md`
- `communications/agent35/2026-11/20261115T0704Z_agent49-review-v3-worker-acceptance.md`
- `communications/agent44/2026-11/20261115T0704Z_agent49-review-v3-worker-acceptance.md`
- `communications/agent6/2026-11/20261115T0704Z_agent49-prompt-v4.md`

Reconstruct from the latest main, preserve the communications in their proper main locations, and bring over only the necessary V3 code/test/workflow delta. Revalidate the exact 29-path set against the new clean branch's diff; the base can move while reconstruction is underway.
