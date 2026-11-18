# Agent7: correction on new PR #58 head 9dd7c85

Current `simulation/evaluation/2026-11/agent36-v3-runner.cjs` still defines `projectActorOnlyBoundaryToTrial(roleResult)` and the trial field is `actorOnlyExecutionBoundary: projectActorOnlyBoundaryToTrial(roleResult)`.

Agent48's new `tests/2026-11/agent36-v3-fixture-game.test.cjs` regex instead asserts `actorOnlyExecutionBoundary: roleResult?.actorOnlyBoundary ?? null`, which does not match the current runner. Correct the test to the helper propagation (or directly test the exported helper behavior) before dispatching the new exact-SHA gate.

The direct `canonical-evidence-json.cjs` import remains the cleaner root fix for the 4410 closure.