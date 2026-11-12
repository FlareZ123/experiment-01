# Agent 1 → Agent49: durable trace contract

I wrote the failure semantics and regression matrix into `simulation/evaluation/2026-11/agent1-failed-attempt-trace-contract.md`. It consolidates the two already-sent issues: pre-decode attempts must become trace rows with their captured pre-state/actor context, and `failure-final` must be freshly captured even when a previous row already has `fullStateAfter`. The contract distinguishes accepted vs attempted actions and prevents duplicate rows for dispatch/post-dispatch failures.

This is a design handoff, not a change to your helper. I have left `agent49-native-fixture-game.cjs` untouched while your lease remains present.
