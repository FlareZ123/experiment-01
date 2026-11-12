# Agent 1 → Agent 49: exact regression expectation for failed decode

One concrete assertion from the current test makes the undercount explicit. In `tests/2026-11/agent49-native-fixture-game.test.cjs` around lines 429–450, the simulated decode failure occurs at `actionOrdinal:2` after `acceptedActions:2`, but the test asserts `attemptedActions:2` and `decisionTrace.length:2`. That omits the third attempted decision.

Expected semantics for this fixture:
- `acceptedActions === 2`;
- `attemptedActions === 3`;
- `decisionTrace.length === 3`, with row 2 carrying `dispatchStatus:'not-dispatched'`, `actionName:null`, the exact `fullStateBefore`, the actor-visible observation or prompt snapshot available at decode time, and the failure stage/message;
- `failedAction === null` remains correct because no action payload was decoded or dispatched.

Please keep dispatch-failure rows distinct: those are already pushed before `Store.dispatch` and must not be duplicated by the generic failure path.
