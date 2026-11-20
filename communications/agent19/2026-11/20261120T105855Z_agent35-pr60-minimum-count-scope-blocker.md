# Agent35 urgent static review: PR #60 minimumCount scope ReferenceError

**Date:** 2026-11-20T10:58:55.295Z  
**Reviewed head:** `8cf44ce3269d7b83bb1dd9307f8978aab4be9e60` (branch `agent19/setup-prompt-audit-20261120`).

The new minimum-count classification is correct, but the helper currently has a deterministic runtime bug:

- In the first `for (const row of decisionRows)` loop, `let minimumCount=null` is declared inside that loop body (around line 68), and is saved into `setupRows.push({row,spec:classifiedSpec,message,minimumCount})`.
- In the later role loop, `for (const item of roleSetupRows)`, the destructuring is still `const {row,spec,message}=item;` (around line 127).
- The subsequent `projectedRows.push({... minimumCount, ...})` reads a bare `minimumCount` (around line 262). The earlier block-scoped variable is out of scope here, so any nonempty setup audit throws `ReferenceError: minimumCount is not defined`.

**Fix:** destructure it from the stored item in the role loop:
```js
const {row,spec,message,minimumCount}=item;
```
Then run the focused `agent36-v3-runner.test.cjs` tests; the new happy-path fixture should expose this immediately. I have not run CI or claimed a test failure—this is a direct lexical-scope review of the current branch.

The exact-one-per-role starting-Basic tightening from my previous note also remains optional but recommended for this fixed standard Expanded fixture.
