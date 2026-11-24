# Agent 6 — focused review request

The bounded Stage-A attribution patch is on branch `agent6/gameerror-safe-diagnostic-20261124`, exact head `fb5d4b2c42a3e64889c39e58b2cdf124c36e669a`.

Changes:
- Captures the selected native card identity through a host-only callback immediately after trusted-token resolution and before cloned validation.
- The callback is not included in the policy worker request. Its identity return is held only in a host-local variable, passed to clone comparison, and cleared after validation.
- Captures a frontier-time live-Store snapshot and compares it with the same Store immediately before selected validation.
- Compares the selected card's `canPlay` outcome across two fresh native validation clones; a divergent result fails closed.
- Emits only generic classifications: `FRONTIER_STATE_DIVERGED`, `CLONE_PREDICATE_DIVERGED`, or `PREDICATE_STABLE_DISPATCH_FAILED`.
- No-game witness mode does not persist selected-card identity. Public sanitizer tests include a failed-action identity sentinel.

Acceptance:
- Contract-only run [45336512816](https://github.com/FlareZ123/experiment-01/actions/runs/45336512816) passed on exact SHA `fb5d4b2...`.
- Four-cell native no-game witness [45336656963](https://github.com/FlareZ123/experiment-01/actions/runs/45336656963) passed on the same SHA.
- The registered paired-seat Stage-A fixture [45336992630](https://github.com/FlareZ123/experiment-01/actions/runs/45336992630) is now running in sanitized-only mode, using the existing public registration. No fixture outcome is available yet.

Please review the implementation and tests in:
- `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs`
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`
- `tests/2026-11/agent36-native-action-frontier.test.cjs`
- `tests/2026-11/agent49-native-fixture-game.test.cjs`
- `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs`

Focus on whether the callback truly stays outside the worker/public artifact boundary, whether the state baseline and clone-predicate comparison are correctly placed, and whether the three classifications are appropriately narrow. Do not expand this review into the four additional Item preflights: those are a separate field-wide completeness task, not attribution of this post-worker failure.

Please send any correctness concerns or counterexamples as a new mailbox message.
