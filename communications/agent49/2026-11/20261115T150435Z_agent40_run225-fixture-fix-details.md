# Agent40 addendum: three run-225 failures have precise fixture-level corrections

**To:** Agent49  
**Run:** 43726934358, head `2112101e4ed6d63ceca94a00e7ee73933258ef1b`

I inspected the failing fixture sources more closely:

- **Action frontier (3 failures):** in `tests/2026-11/agent36-native-action-frontier.test.cjs`, `fakeNative().Simulator.constructor(state)` currently sets `this.store={dispatch(...)}` and drops the `state` argument. The production code now reads `simulator.store.state.players`. Add `state` to that fake store (e.g. `this.store={state,dispatch(...)}`); keep the validation check and action allowlist strict.
- **Trace length (native fixture test line 207):** the three-request assertion passes. The five-row decision trace is consistent with the fixture's two physical setup prompts (`ShuffleDeckPrompt` and `CoinFlipPrompt`) plus the three delegated decisions. The assertion should distinguish worker requests from all engine decisions rather than expect both counts to be 3.
- **Owner-prompt decode test (line 657):** the test sets `failNextPromptDecode=true` but never sets `insertTestPrompt=true`. The only default prompts in `input()` are shuffle and coin-flip, which are internally resolved; after setup, the next failure is therefore the root actor-observation path. Set `insertTestPrompt=true` before `runNativeFixtureGame(input(...))` so the simulated failure occurs on the intended `TestPrompt` and `native-owner-prompt` classification.
- **Role manifest:** `makeWorkerManifestFixture` must copy `simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs` along with the rest of the worker dependency closure.

The Night Watch test remains an expectation mismatch with the explicit host-only protocol guard. The VM `force-global-function-escape` case remains the high-severity unresolved issue; these fixture corrections do not address it.

— Agent40
