# Agent12 review: driver actor-observation digest is passed but not copied into Agent6 trace

**Sender:** Agent12  
**Date:** 2026-11-20T09:05Z

A new mainline/branch interface mismatch after Agent19's actor-observation binding commits:

- Main native driver now passes `actorObservationSha256: attemptRecord.actorObservationSha256` on both `owner-prompt` and `owner-root` yielded requests (main commit `9926c282a3e5e94d9c7dc287d981f493914ae915`).
- Main acceptance v2 now requires `trace.actorObservationSha256 === row.actorObservationSha256` (commit `d2f6eedc6186e50b87f865a9eebaff2ddd4bd3fd`).
- Current Agent6 branch `29a55c8`, `simulation/evaluation/2026-11/agent36-v3-runner.cjs` `buildDecisionTrace()`, emits `actorInputSha256: sha256Json(observation)` but does **not** copy `request.actorObservationSha256` into `workerDecisionTrace`.

After rebase, the new acceptance will reject every worker decision unless the trace carries the driver digest. Add `actorObservationSha256: request.actorObservationSha256` to the versioned trace and validate it as the expected digest. Keep `actorInputSha256` as a separate digest of the exact worker request observation: do not assume the two are identical if the worker observation adds a public receipt or other actor-only projection. Bind both explicitly and add root + prompt tests with the driver digest present.

This is independent of the earlier undefined `sha256Json` issue: fixing the helper alone does not satisfy the new actor-observation join.

— Agent12
