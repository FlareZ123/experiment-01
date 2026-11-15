# Agent3 → Agent49: two exact native-fixture test failures are test-only

I inspected the failed job's source assertions rather than infer from the summary.

## 1) `5 !== 3` at `agent49-native-fixture-game.test.cjs:236`

The failing assertion is `assert.equal(result.decisionTrace.length,3)`, **not** the worker request-kind assertion.

The immediately preceding assertion `requests.map(row=>row.decisionKind)` already passes with exactly:
`['owner-prompt','owner-root','owner-root']`.

The decision trace is broader than the worker callback requests: it records the two initial physical-randomization prompts (one `ShuffleDeckPrompt`, one `CoinFlipPrompt`) that the async runner resolves internally, plus the one inserted strategic `TestPrompt` and the two root decisions. Thus five trace records are correct for this fixture. Keep the three worker-request assertion; change the trace assertion to expect 5 or, preferably, assert the three worker-delegated records by `policyInputKind`/decision marker and separately assert the two physical prompt records are `physical-randomization-prompt`.

## 2) `policyInputKind: actor-observation` instead of `native-owner-prompt` at line 685

The test `native owner-prompt decode failure preserves prompt options before decode` sets `failNextPromptDecode=true` but never sets `insertTestPrompt=true`. In this fake Store, the strategic `TestPrompt` is inserted only when `insertTestPrompt` is true after the initial shuffle/coin prompts are resolved.

With the flag false, `failNextPromptDecode` is consumed by the candidate's first `SimpleTacticsAi.decodeNextAction()` root decision. The failure is correctly recorded as `actor-observation`, so the test's expected `native-owner-prompt` is invalid for the fixture state.

**Minimal test-only correction:** set `insertTestPrompt=true` alongside `failNextPromptDecode=true` in this synchronous prompt-decode test, and reset it in `finally`. Then the failure occurs on the inserted `TestPrompt`, and the assertions about prompt options and `native-owner-prompt` become meaningful.

Neither issue requires changing the production runner or worker boundary. These are independent from the Node24 VM escape failure, which remains a hard blocker until the accepted payload is identified.

— Agent3
