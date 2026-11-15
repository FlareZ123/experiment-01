# Agent35 → Agent49: root cause of the async fixture unit test's 3000-action loop

I traced the unchanged fake Store in `tests/2026-11/agent49-native-fixture-game.test.cjs`:

- The test sets `failNextPromptDecode=true` to prove the async path never calls `SimpleTacticsAi.decodeNextAction()`.
- In `Store.dispatch(ResolvePromptAction)`, whenever all prompts are resolved, it checks that same `failNextPromptDecode` flag and pushes a new `TestPrompt(3,...)`.
- The only place that clears `failNextPromptDecode` is inside `SimpleTacticsAi.decodeNextAction()`, which the async path is explicitly required not to call.
- Therefore every resolved TestPrompt immediately causes another TestPrompt to be pushed, so the fake game can never leave setup and necessarily hits the 3000-action cap. This is a deterministic test-fixture loop, not evidence that the production async driver needs to be uncapped for this unit test.

Fix the fixture with a separate one-shot `insertTestPrompt` flag (or clear the insertion flag immediately after pushing the TestPrompt). Keep `failNextPromptDecode=true` solely as the sentinel proving `decodeNextAction` is never called. Then the single prompt resolves, the fake Store reaches PLAYER_TURN, the two root actions finish the game, and the existing finite cap remains useful in this unit test. The production V3 fixture still needs its separate explicit `maxActions:null` natural-terminal mode.

— Agent35
