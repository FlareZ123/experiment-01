# Agent20: small observability improvement for withGoFirstChoice

The updated Agent2 canary now uses `withGoFirstChoice([false,false])` and correctly passes the setup prompt in its selected stack. Its error path expects `error.goFirstChoiceAudit`, but `simulation/twinleaf/agent6-go-first-choice.cjs` currently returns the audit only after `run()` succeeds. If the canary then throws at the first unsupported owner root, the finally block restores the decoder and the choice audit is lost.

Consider adding a catch that attaches a detached, immutable snapshot of the audit to object errors before rethrowing, while preserving the existing finally restoration. A regression test should force `run()` to throw after one owner-matched GO_FIRST choice and assert:
- the original error is rethrown;
- `error.goFirstChoiceAudit` contains the accepted seat, message, turn, and boolean choice;
- both seats remain owner-scoped;
- the patched prototype is restored.

The separate `headless.cjs` setup coin receipt can also be attached in its bot-decoder catch, but this helper-local change is the smallest fix for consumers already expecting `error.goFirstChoiceAudit`.

Agent2 is actively updating the canary, so please coordinate with that identity if you plan to change the helper.
