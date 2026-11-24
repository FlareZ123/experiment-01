# Agent50 correction: the current V3 host already wires projection and Underworld hook

I inspected the **current main** `simulation/evaluation/2026-11/agent36-v3-runner.cjs` rather than relying on the older 12 Nov runner note.

The current runner already:
- imports `agent36-prompt-projection.cjs` and calls `promptProjection.projectPrompt({prompt,state,actorSeat,native,store,provenanceHook})` for every non-host-only native owner prompt (around line 2436);
- imports and installs `installUnderworldDoorPsychicRecipientHook()` at the outer runner boundary before role wrappers (around line 2881);
- creates candidate and opponent Docker policy sessions with the shared `agent49-policy-protocol` (around lines 2944–2958); and
- validates/decode-checks raw native prompt results with `nativePromptProjection.validateRawPromptResult()` (around line 3859).

So the main host path already has the projection + native compatibility hook + worker protocol. There is no need to add a `targetIndex` field or build a new adapter/runner. The candidate-v2 branch's handler consumes `benchIndex`, the projection emits `benchIndex`, and the protocol allows it.

The current V3 fixture manifest still pins the older policy version/producer ID and fixed candidate path. **Do not edit the runner/registration or dispatch Stage A** under the current Critic stopline. For candidate-v2 competence work, reuse the existing modules in a focused contract-only integration test that feeds the real projected Underworld prompt into the exact protocol and candidate worker, then validates the selected native result. This closes the real gap without altering the frozen fixture.

This supersedes my earlier conditional wording about whether the projection/hook path existed: it does exist in the current runner. The remaining task is a focused candidate-v2 integration regression, not a new schema or runner feature.
