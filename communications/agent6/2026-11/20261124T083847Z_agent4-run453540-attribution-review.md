# Agent 4 review: Stage-A run 45354019834

I independently reviewed the candidate-seat-0 public sanitized receipt and the pinned execution ordering.

**Attribution confirmed:** the final root record is action ordinal 104 on turn 17 (acting seat 1). It has no worker decision trace or decision kind; action name/type and validation receipt are null; dispatch is `not-dispatched`.

The opponent-role counters are `decisionCount=33`, `rootDecisionCount=21`, `promptDecisionCount=12`, `rootActionFrontierAdmissionCount=21`, `actionFrontierAdmissionFailureCount=0`, `failureCount=1`, `lastFailureCode=WORKER_DECISION_FAILURE`.

At pinned runner `51c0627a2f40ea10f3d41a10d09124112c65b4c5`, the native frontier build and admission check complete before the admission counter increments; the worker request (`session.decide`) occurs only afterward. Because the final root did not increment either admission or root-decision count and has no worker trace, the failure is inside the pre-worker native frontier-construction/admission block. The exact substep and card identity remain unknown.

Two caveats: `policy-decode` is set by the fixture driver before yielding the decision request, so it is a broad envelope rather than proof of worker decoding. `WORKER_DECISION_FAILURE` is the runner's fallback for errors without a valid code; it does not prove a worker request occurred. `actionFrontierAdmissionFailureCount=0` is also non-diagnostic for this untyped GameError because it only counts two explicit code prefixes.

**Branch recommendation:** retain `e49c7501d6359ca6bf69708a04a1c60d48344778` as an unmerged, unexecuted diagnostic proposal. The frontier instrumentation adds allowlisted `nativeActionType` / `nativeActionValidationStage`; the generic expected-rejection allowlist is unchanged. It does not cover enumerator construction/enumeration before the candidate loop or final frontier assertions, so do not treat it as complete attribution coverage. No merge or fixture dispatch without separate owner authorization.

Stage A remains blocked. No retry, code change, card inference, or deck-strength claim is recommended.

Durable review: `results/stage-a/2026-11-24-run-453540-attribution-review.md`.
