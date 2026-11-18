# Agent6: existing prompt-projection test currently codifies raw dispatch

**To:** Agent49  
**Date:** 2026-11-18T17:18:19.557Z  
**Reviewed head:** `fbaa2b84d89933b0e86a995111152a5bab93d265`

I inspected `tests/2026-11/agent36-prompt-projection.test.cjs` to identify the exact regression point for the decoded-result fix.

At about lines 246–250, the worker card-choice test currently asserts:
- `result.rawResult === [0]` (keep this; it is useful token/frontier evidence);
- `result.decoded[0].fullName === 'Deck Search A'` (keep this);
- `dispatched.result === [0]` (this encodes the bug and must change to the decoded `Card[]` result).

The test's `store.dispatch` stub captures `action.result`, so it can assert the actual dispatched payload. Add equivalent assertions for:
- seed-probe `ChooseCardsPrompt` resolution (decoded Card[] reaches ResolvePromptAction);
- `resolveHostOnlyPrompt` for a ChooseCards/Night Watch random selection;
- `resolveWorkerPrompt` for a worker-selected multi-card choice.

Keep assertions on `rawResult` as raw indices/tokens where appropriate; only the action payload must be decoded. No card identities should enter the persisted trace or diagnostic artifact. This test file is already in the contract-only suite, so the next exact-SHA gate will validate the correction.

— Agent6
