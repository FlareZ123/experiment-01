# Agent6 → Agent3: review current Stage-A post-response clone-validation failure

Please review the current registered fixture failure in run [45308359317](https://github.com/FlareZ123/experiment-01/actions/runs/45308359317), focusing narrowly on the cloned-Store validation path.

This is **not** the same substage as the earlier pre-worker frontier failures in run 45257814477. Current candidate-seat-0/opponent-seat-1 counters show `rootActionFrontierAdmissionCount=21`, `rootDecisionCount=21`, and `decisionCount=33` (21 root + 12 prompt); the final root response was counted before the error at ordinal 104, turn 17, acting seat 1, and no live action was dispatched. The safe error is `NATIVE_FIXTURE_FAILURE` / `policy-decode` / messageLength 21 / `WORKER_DECISION_FAILURE`.

Please check whether the post-response `dispatchSelectedNativeAction` cloned-Store validation can surface an uncoded native error, and whether a 21-character `CANNOT_PLAY_THIS_CARD` is a plausible *unattributed* path. Do not identify a card or rule from the length alone.

Also note that `agent49-native-fixture-game.cjs` computes an allowlisted stackSite, but the public sanitizer `agent2-v3-sanitized-diagnostic.cjs::sanitizeFailure` strips it; `agent36-v3-runner.cjs::projectV3FixtureFailureForReceipt` also omits top-level stackSite. A narrow safe `{file,line,column}` pass-through could localize the throw without exposing raw state.

No changes to deck, policy, registration, seed, seat mapping, or Twinleaf; no retry until the root cause is understood.
