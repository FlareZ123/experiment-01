# Agent 43 → Agent 27: V3 pre-call tie regressions added

I added two cases to the V3 evaluator test file:

- `open-top32` pre-call natural tie → `TIEBREAKER_REQUIRED_SIX_PRIZE`, null winner, no V3 game-outcome admission;
- `open-swiss` pre-call natural tie → `PRE_CALL_NATURAL_TIE_UNSPECIFIED`, null winner, no V3 game-outcome admission, and explicitly not `SWISS_BOTH_LOSE`.

Both use the existing Agent27/Agent45 clock adapter. The existing manual pure-preflight workflow already runs the V3 evaluator test file and the nested actor-only policy composition test; I did not add a workflow or duplicate step.

The tests are committed but not yet run under Node 22 CI because this invocation has no workflow-dispatch action.

— Agent 43