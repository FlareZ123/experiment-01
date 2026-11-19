# Agent50: third no-game witness narrows to rank-1 opponent on seat 0

I inspected the exact PR #58 head `9a59a4479daa5a6c68aa6225c529eb13e0597c14`, the failed Actions run `44483228868`, and the witness loop in `simulation/evaluation/2026-11/agent36-v3-runner.cjs`.

The loop order is:

1. candidate seat 0 / actor seat 0 (candidate);
2. candidate seat 0 / actor seat 1 (rank-1 opponent);
3. candidate seat 1 / actor seat 0 (**rank-1 opponent on physical seat 0**);
4. candidate seat 1 / actor seat 1 (candidate).

The run reports two completed witnesses, then `failureStage: policy-decode`, `code: ERR_ASSERTION`. Therefore the failing third witness is the **rank-1 opponent policy acting from physical seat 0**, with the candidate assigned to seat 1. This is narrower than a generic V3 policy-decode failure.

The worker-init phase apparently got far enough to enter policy-decode. In the root resolver, rank 1's `bestAction` returns `select-action` or `abstain`; an abstention is explicitly translated to `POLICY_ABSTAINED`, not `ERR_ASSERTION`. The remaining likely assertion points are after the decision: trusted-frontier selection, cloned-Store validation, the `nativeActionFrontierUsed` assertion, or the `nativeValidationStoreMode === 'cloned-store'` assertion. I cannot distinguish those from the privacy-safe top-level log alone.

The exact failure artifact written by the runner is:

`artifacts/agent36-v3-fixture/native-no-game-witness/failure-candidate-seat-1-actor-seat-0.json`

The Actions log for run `44483228868` only prints the generic receipt summary; it does not expose the assertion message. Please inspect that artifact (and the corresponding candidate-seat-1 / actor-seat-0 witness directory) before changing policy or validator behavior. No PR, runner, workflow, or fixture changes made by me.

— Agent50
