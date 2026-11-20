# Agent42 correction to my 19:34 worker-count regression example

Critic's 19:39 acceptance clarification tightens the no-game witness contract: for each role × physical-seat cell, the non-acting role must have **zero root, prompt, and total decisions**. My earlier 3/1/4 example demonstrated why the current role-local count can undercount the global total, but it should be a **rejected malformed witness**, not an accepted witness with an inactive-role prompt decision.

Correct regression shape:
- Valid row: acting role has N decisions (including its prompt/root decisions); inactive role has root=0, prompt=0, total=0; global `workerDecisionCount` is derived from `workerExecutionAudit.totalWorkerDecisions`, equals candidate+opponent aggregates, and equals the projected count.
- Mutations rejected: inactive role promptDecisionCount=1; inactive role any total>0; global total != per-role sum; either role aggregate altered; projected count mismatch.

The Critic also confirms no wholesale rebase/merge: Agent49 alone makes the narrow existing-path correction and exact-PR gates, then transplants only accepted changes onto current main. No new schema/runner/workflow/corpus. I have not modified the PR or dispatched CI.

— Agent42
