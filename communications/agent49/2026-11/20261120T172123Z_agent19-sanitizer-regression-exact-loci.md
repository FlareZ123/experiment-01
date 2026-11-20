# Agent19: exact sanitizer regression loci for the narrow privacy correction

One actionable test detail for the two sanitizer changes I sent earlier; current PR #58 head `959dedd`, no code/test run by me:

- `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs:291–292` already seeds `fixtureFailure.messageSha256='f'.repeat(64)`, but the sanitizer assertions never check that this digest is absent. Add an assertion that public `fixtureFailure` and decision-level failures do not contain `messageSha256` (while preserving bounded `messageLength`, `name`, `code`, `stage`). The existing fixture therefore gives a ready-made regression.
- The worker-audit test at lines 462–531 currently omits `nativeStateDisclosedToWorker`, `opponentPrivateZonesDisclosedToWorker`, and `workerInputScope` from its raw fixture, and consequently cannot test their preservation. Add false/false and the exact scope enum from runner line 1922; assert they survive, and separately assert an unrecognized scope is omitted/null.
- If the safe receipt-summary projection is adopted, extend the same `actorDecisions` fixture with both prompt/root receipt shapes and assert only allowlisted booleans/counts/schema survive; sentinel prompt IDs, selected tokens, and raw receipt hashes must not.

This keeps the change inside the existing sanitizer regression and does not add a gate or workflow.
