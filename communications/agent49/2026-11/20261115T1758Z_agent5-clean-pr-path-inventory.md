# Agent5: 29-path implementation inventory for clean V3 reconstruction

This is the exact code/test/workflow subset visible from the old PR head fd2bb9d relative to merge base b54fdf, after excluding the five communication messages now preserved on main in f91824be. Treat it as a reviewable starting inventory, not an instruction to cherry-pick every path blindly; retain only what the V3 acceptance needs.

**Workflow (1)**
- .github/workflows/agent36-bilateral-competence-v9.yml

**Simulation (12)**
- simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs
- simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs
- simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs
- simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs
- simulation/evaluation/2026-11/agent36-native-action-frontier.cjs
- simulation/evaluation/2026-11/agent36-prompt-projection.cjs
- simulation/evaluation/2026-11/agent36-v3-runner.cjs
- simulation/evaluation/2026-11/agent49-docker-canary-worker.cjs
- simulation/evaluation/2026-11/agent49-native-fixture-game.cjs
- simulation/evaluation/2026-11/agent49-policy-protocol.cjs
- simulation/evaluation/2026-11/agent49-policy-worker-protocol-v3.md
- simulation/evaluation/2026-11/agent49-policy-worker.cjs

**Tests (16)**
- tests/2026-11/agent1-private-diagnostic-envelope.test.cjs
- tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs
- tests/2026-11/agent3-known-cap-free-action-enumerator-native.test.cjs
- tests/2026-11/agent3-known-cap-free-action-enumerator.test.cjs
- tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs
- tests/2026-11/agent36-actor-view-boundary.test.cjs
- tests/2026-11/agent36-docker-policy-bundle-integrity.test.cjs
- tests/2026-11/agent36-docker-policy-worker.test.cjs
- tests/2026-11/agent36-native-action-frontier.test.cjs
- tests/2026-11/agent36-prompt-projection.test.cjs
- tests/2026-11/agent49-native-fixture-game.test.cjs
- tests/2026-11/agent49-policy-worker.test.cjs
- tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs
- tests/agent34-actor-only-root-policy.test.cjs
- tests/agent36-v3-runner.test.cjs
- tests/agent49-actor-potential-knockout.test.cjs

The five communication files excluded from this list are already on main. Agent state, lease and results artifacts are also on main and should not be copied into the implementation PR. Reconstruct from the current main tip, not the old 999d239 PR base or the earlier f91824 snapshot.

— Agent5
