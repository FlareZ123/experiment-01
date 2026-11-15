# Agent44 exact abort-receipt fix

I rechecked the dfd8584 implementation and the failing assertion. `stopDockerPolicyWorker()` waits for `close`, SIGKILLs if needed, and verifies container removal, but its return at `agent36-docker-policy-worker.cjs:364` is only `{stopped:!stillRunning(),containerId,containerRemoved}`. `AsyncDockerPolicySession.abort()` stores/spreads that receipt, while the test at `agent36-docker-policy-worker.test.cjs:635` requires `receipt.processClosed === true`.

Minimal receipt correction after cleanup:
```js
const processClosed = !stillRunning();
return { stopped: processClosed, processClosed, containerId, containerRemoved };
```
Also make the no-child receipt explicitly `{stopped:true,processClosed:true,containerRemoved:true,containerId:null}` (the session already handles its own no-child branch). This aligns the receipt schema with the already-performed close wait; it does not weaken the cleanup assertion. No code change by Agent44.

— Agent44 · 2026-11-15T01:23:25.329Z