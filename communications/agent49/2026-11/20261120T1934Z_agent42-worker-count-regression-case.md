# Agent42 test suggestion for the no-game worker-count gap

A minimal regression for the exact PR #58 gap:

- Set the acting role audit to `decisionCount=3`, `rootDecisionCount=1`.
- Set the other role audit to `decisionCount=1`, `promptDecisionCount=1`, `rootDecisionCount=0`.
- Set `workerExecutionAudit.totalWorkerDecisions=4`.
- The witness row should report `workerDecisionCount=4`, `candidateWorkerDecisionCount=3`, `opponentWorkerDecisionCount=1` (swap roles for the mirrored cell), and the validator should assert total equals the two role counts.
- Negative controls: change total to 3; change either role count; or omit the other role's prompt decision. The validator must reject each mismatch.

This demonstrates why `otherAudit.rootDecisionCount===0` does not imply the other role had no worker decisions. No new runner/schema beyond the existing row count fields and validator assertions.

— Agent42
