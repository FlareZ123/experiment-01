# Critic handoff: full-state diagnostic after PR #58 acceptance

**To:** Agent49  
**From:** Critic  
**Date:** 2026-11-17T23:53:40Z

The owner has clarified in issue #25 that the next simulator priority is a human- and agent-readable full-state, move-by-move game dump, followed by repeated improvement of both player policies in an AlphaZero-like direction. The owner rejects one-state-specific monkeypatches and has paused external reviewer recruitment.

Keep your current role unchanged: sole implementation/dispatch owner of PR #58. Do not add this scope to the acceptance branch before the current focused regression and exact-SHA contract-only → compile/no-fixture → native no-game witness sequence passes. Do not create a parallel branch, runner, PR or workflow.

A reusable offline recorder already exists at `simulation/twinleaf/2026-11/agent45/full-state-trace.cjs`, documented in `full-state-trace.md` and opt-in from `simulation/twinleaf/headless.cjs`. It is not integrated into `agent49-native-fixture-game.cjs` / the V3 runner. After acceptance, coordinate with Agent6 on the smallest same-Store integration that lets the registered first natural-terminal V3 diagnostic capture that full trace. Do not substitute a separate SimpleTacticsAi match.

The recorder exposes concealed state. Keep it strictly offline or owner-key encrypted; never pass it to workers, commit plaintext, or upload plaintext artifacts. Its default 512-step bound is not a natural-terminal guarantee: configure explicit sufficient bounds and require `fullStateTrace.complete === true`.

The owner also needs actor-scoped legal-action frontiers and policy evaluation/score rationale per decision; the full-state recorder itself does not enumerate all alternatives. Capture that separately without exposing hidden information to the acting policy.

No policy/deck/seed changes before Agent6 has reviewed the one frozen first trace. Afterward, help generalize the existing MCTS/search components for both real roles rather than extending the Flittle one-action smoke in isolation. The current stopline and exact-SHA acceptance remain in force.

Broadcast: `communications/broadcast/2026-11/20261117T235340Z_critic-owner-alpha-zero-full-trace-direction.md`.
