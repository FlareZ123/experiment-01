# Stage-A run 45354019834: pre-worker frontier-build failure

**Disposition:** attribution-only review; Stage A remains blocked. No fixture retry, workflow dispatch, adapter change, or merge is authorized by this review.

## Public sanitized evidence

Reviewed artifact `agent36-common-v9-bilateral-competence-45354019834.zip` (artifact ID `14902295024`), file `agent36-v3-fixture/candidate-seat-0/fixture-game.sanitized.json` (SHA-256 `a14f21469d4bd2dd3e173b0b5ec71e1c3ebafae6c42265a8a16c2d9b179f1da8`).

The final actor record is action ordinal 104, acting seat 1, turn 17, root decision, policy input `actor-observation`. It has no worker decision trace or decision kind; `actionName`, `actionType`, and `validationReceipt` are null; dispatch status is `not-dispatched`.

Opponent-role audit counters: `decisionCount=33`, `rootDecisionCount=21`, `promptDecisionCount=12`, `rootActionFrontierAdmissionCount=21`, `actionFrontierAdmissionFailureCount=0`, `failureCount=1`, `lastFailureCode=WORKER_DECISION_FAILURE`. The wrapper reports `stage=policy-decode`, `name=GameError`, and native message `CANNOT_PLAY_THIS_CARD`.

## Stage attribution

At pinned runner revision `51c0627a2f40ea10f3d41a10d09124112c65b4c5`, `agent36-v3-runner.cjs` constructs the native frontier and runs the admission check inside the validation-RNG block (lines 2551–2564). Only after that block returns does it increment `rootActionFrontierAdmissionCount` (line 2565); it calls `session.decide` afterward (line 2570), and increments `decisionCount` / `rootDecisionCount` only after the worker response returns (lines 2574–2578).

The final root record therefore failed before the frontier/admission block completed: the admission and root-decision counters remain at 21, and there is no worker trace, selected action, validation receipt, or dispatch. This localizes the failure to the pre-worker native frontier-construction/admission block. It does **not** identify the exact internal substep (enumerator construction/enumeration, frontier build, or admission check), nor any card identity.

Two labels must not be misread:
- `policy-decode` is assigned immediately before the fixture driver yields the root request to the runner (`agent49-native-fixture-game.cjs`, lines 984–988); it is a broad decision-resolution envelope, not proof that a worker decoded a response.
- `WORKER_DECISION_FAILURE` is the runner's fallback when an error has no valid code (`agent36-v3-runner.cjs`, lines 2233–2234). The admission-failure counter increments only for two specific code prefixes (lines 2238–2240), so its value of zero does not establish that admission succeeded.

## Diagnostic branch disposition

Retain branch commit `e49c7501d6359ca6bf69708a04a1c60d48344778` as an **unmerged, unexecuted diagnostic proposal**, not a fix. Its frontier catch attaches only allowlisted `nativeActionType` and `nativeActionValidationStage` fields to eligible GameErrors. The generic `isExpectedActionRejection` logic is unchanged from the pinned base (lines 390–398); no rejection allowlist was broadened. The added stage tags cover candidate-loop validation, but do not tag errors from enumerator creation/enumeration before that loop or final frontier assertions.

Do not merge or dispatch the branch without a separate owner decision. If a later probe is authorized, confirm instrumentation coverage for the still-untagged pre-loop/finalization stages before relying on it to identify the failing substep. Do not infer or expose card identity, and do not weaken generic rejection handling.

**Conclusion:** Stage A is blocked pending owner authorization and finer-grained attribution. This result makes no deck-strength, matchup, or win-rate claim.
