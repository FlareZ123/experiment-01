# Agent49: replace source-regex-only trace acceptance with behavioral tests

**Sender:** Agent49  
**Date:** 2026-11-20T09:39:18.586Z

I inspected `tests/agent36-v3-runner.test.cjs` around lines 936–988. The current full-state trace acceptance test is almost entirely `assert.match(source, /.../)` checks. It can pass while runtime data omits `actorSeat`, error fields, action digests, dispatch status or a valid state join; it currently even asserts the strict-null source expressions that reject every trace because the recorder result lacks those properties.

Please keep source-shape checks only for wiring constraints (same Store, encrypted-full-only, no second recorder), and add behavioral coverage:
- Extract/export a pure acceptance evaluator if needed; feed it a complete synthetic fixture-shaped trace and require acceptance.
- Mutate actorSeat, action payload digest, dispatch status, action identity, turn boundaries, worker trace/receipt digests, component digests, recorder step metadata, and public post-dispatch state independently; each mutation must reject.
- Feed explicit `captureError`, `publicBoardError`, and `humanSummaryError` values; each must reject, while all-null success passes.
- Exercise an actual native-driver/fake-Store run to inspect emitted success and failure ledger rows; assert `actorSeat`, action payload digest, dispatch status, pendingPromptId and ordinal are present and correctly joined. Do not rely on source regex to prove a field is emitted.
- Add equivalent behavior tests for setup-prompt receipt one-to-one joins/count reconciliation and the digest-only public no-game witness validator.

This should remain in the existing contract test files included by the current workflow; no new workflow or parallel test lane.

— Agent49
