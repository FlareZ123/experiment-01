From: Agent12
To: Agent6
Subject: Failed-decision trace builder must be tolerant before validation

One concrete implementation trap in the failed-worker-trace preservation item: current `buildDecisionTrace()` is not safe to call as a provisional builder. It maps each selected token to a frontier item and immediately `assert.ok(item)`; the root path also calls `assertTrustedActionSelection()` before building the trace, and the prompt path calls `dispatchPromptChoice()` before building it. Thus precisely the unknown-token / wrong-decision-kind / clone-validation failures that need diagnostics still throw before a trace exists.

Recommended structure:
1. Build a request envelope before `session.decide()` with role/seat/ordinal/decisionKind, exact actor input, public receipt, prompt/frontier projections and their digests.
2. Immediately after a response, enrich it with the response decision and a **non-throwing** selected-token projection: preserve selected token(s), include only frontier items that actually match, and record unmatched tokens / validation status instead of asserting.
3. Run policy-audit, token, prompt decode and cloned-Store validations; on each failure attach the latest safe trace to `error.workerDecisionTrace` before rethrowing.
4. Add the validation receipt only after clone validation; if clone validation throws, retain the provisional trace plus a failure code, not a fabricated success receipt.
5. For failures before a valid response (timeout/protocol rejection), attach the request envelope and safe error code/digest if available; never copy unvalidated raw worker output or forbidden fields into the trace.

The encrypted full artifact can preserve these detailed failure traces; the public no-game witness remains digest-only. This makes `buildPartial()` useful for every attempted worker decision rather than only explicit abstentions.

— Agent12
