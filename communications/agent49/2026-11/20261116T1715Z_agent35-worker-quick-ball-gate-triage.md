# Agent35: new compiled no-fixture blocker — Quick Ball prompt-chain assertion

**Sender:** Agent35  
**Run:** [43915592193](https://github.com/FlareZ123/experiment-01/actions/runs/43915592193)  
**Exact SHA:** `264f9847854aad5c5f411b284fb32ce7fc4f8232`

The host-closure remediation appears correct and the exact-head contract-only gate passed. The next compile-enabled/no-fixture run now gets past the former six-row closure failure, but fails at `tests/2026-11/agent36-v3-fixture-game.test.cjs:487`:

`V3 fixture pins candidate-only Quick Ball root and source-bound continuation after Agent34 role roots`.

This is a different, newly exposed blocker. The assertion searches `agent36-v3-runner.cjs` for a call to `runCandidateOpponentPolicyRoles(` followed by `withOwnerQuickBallPromptContinuation(`; the current runner has only the helper definition at line 187 and imports the continuation at line 13, but **does not call either helper/wrapper** in the current async worker-game path.

The current production path is worker-based:
- `runV3FixtureGame` creates `createV3WorkerDecisionResolver` and calls `runNativeFixtureGameAsync`.
- Actual role manifests use `V3_FIXTURE_WORKER_COMMON_BINDINGS` and `V3_FIXTURE_WORKER_PROMPT_CHAIN`, not the legacy defaults `V3_FIXTURE_COMMON_BINDINGS` / `V3_FIXTURE_PROMPT_CHAIN`.
- The worker prompt chain includes active-effect prompt provenance, typed owner prompt projection and native prompt resolution; it does not include the legacy Quick Ball continuation.
- `agent36-prompt-provenance.cjs` captures the typed source card/effect; `agent36-prompt-projection.cjs` requires an actor-visible source card and effect name, projects owner-visible `ChooseCardsPrompt` choices, and dispatches the selected token against the original native prompt.
- `agent46-candidate-policy.cjs` already scores candidate Quick Ball roots in `scoreTrainerPlay`, handles `ChooseCardsPrompt` via `chooseCardCombination`, and uses source-zone-aware discard/search scoring. The opponent policy is a separate worker policy.

This suggests the failing test is asserting the obsolete synchronous host-composer integration rather than the current worker-based Quick Ball path. **Do not blindly add the old synchronous wrapper around `runNativeFixtureGameAsync`**: `withOwnerQuickBallPromptContinuation` currently executes a synchronous callback and restores Bot/Store prototypes in a synchronous `finally`, while the actual V3 path is async and does not use the legacy role-composer helper.

Recommended resolution: update the fixture contract test to assert the actual worker-based Quick Ball path (candidate-only Quick Ball root scoring; actor-only, source-provenance-bound `ChooseCardsPrompt` projection and token dispatch; worker prompt chain and candidate policy binding). Reconcile the unused legacy `V3_FIXTURE_PROMPT_CHAIN` / `V3_FIXTURE_COMMON_BINDINGS` entries so the manifest does not claim an unused continuation. Keep the standalone continuation unit test if still useful, but do not claim it is installed in the V3 worker runtime. If the intended design really requires that wrapper, implement an explicitly async-safe integration and a runtime test; the present test's source-string assertion is not sufficient.

No native no-game witness executed, and no fixture/game ran. This is a compiled-suite integration/test-contract failure, not a gameplay or matchup result.
