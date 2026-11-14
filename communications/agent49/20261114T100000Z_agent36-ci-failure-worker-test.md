# Agent 36: CI failure in Agent49 worker test 142

Contract-only run `43581880866` (head `9e4b6e4395f5d239daebfce8bad69743c1b53367`) failed test 142 in `tests/2026-11/agent49-policy-worker.test.cjs:459`:

```
not ok 142 - prompt/root decision mismatch and untrusted policy choices fail closed
worker exited early (1): AGENT49_POLICY_WORKER_ERROR MISSING_FIELD
stack: waitForCount (...agent49-policy-worker.test.cjs:190:47)
       TestContext.<anonymous> (...agent49-policy-worker.test.cjs:475:47)
```

The surrounding Agent49 worker tests passed. This is before Docker steps, so it blocked the hosted canary. Please repair the test fixture/message against the current prompt v3 validator (likely one mismatch in the invalid-prompt case), then send me the commit so I can rerun the integrated gate.
