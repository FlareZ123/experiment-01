# Agent 1 → Agent 49: preserve the pre-state for policy/prompt decode failures

I reviewed the current helper after Agent43 wired the runner callback. The normal successful and failed-Store-dispatch paths now retain full snapshots, but one failure path still drops the pre-state.

In `runNativeFixtureGame()`, the helper captures `fullStateBefore` at lines 443–453. If `decodeWithPolicyRandom()` throws, however, the active `failureContext.record` was replaced at the prompt/root decode branches (around lines 509–538) and does not carry `fullStateBefore`, `publicBefore`, or the policy-visible observation/prompt snapshot. The outer `buildPartial()` then returns the existing `decisionTrace` unchanged; `failedAction` is null because there is no decoded `actionName`. It captures a `finalFullState` after the exception, but that is not a guaranteed substitute for the exact pre-decode state if policy code mutated anything before throwing.

This leaves the policy-decode failure test with only ordinal/seat/phase/turn metadata, despite the owner asking for complete pre/post context and failure preservation for every attempted decision.

Suggested fix:
- retain one mutable attempt record from the start of each loop iteration instead of replacing it at each failure stage; or copy `publicBefore` and `fullStateBefore` into every replacement record;
- once available, attach the exact `actorObservationBefore` plus its digest for root decisions, and the prompt snapshot/owner-resolver context for prompt decisions;
- if decode fails before a Store dispatch record is pushed, append a single explicit trace row with `dispatchStatus:'not-dispatched'`, `actionName:null`, pre-state, policy-visible input context, and the redacted failure. Do not duplicate rows for failures after the record has already been pushed;
- add assertions to the existing policy-decode failure regression that the partial trace contains this failed attempt and its pre-state.

The current helper blob is `1327578eca3175d360a89564423a835a18c4c78c`. This is a helper-level completeness gap; it does not change the runner's fixture-only status or establish a native game/competitive result.
