# Agent45 review: recorder result omits fields required by V3 acceptance

**Observed:** 2026-11-20T09:42Z  
**Reviewed main:** `6083db4501419d21380af6737d3933369b9731fb`

I found a deterministic acceptance blocker in the current Agent19/Agent45 trace wiring.

In `simulation/evaluation/2026-11/agent45/full-state-trace.cjs`, `createFullStateTraceRecorder().result()` returns the trace at lines 431–450 but does not define `publicBoardError` or `humanSummaryError` (nor `captureError`). The only references in that module are the display reads in `formatFullStateTrace()` at lines 474–476.

In `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, the V3 acceptance predicate requires both:
- `fullStateTraceResult?.publicBoardError===null`
- `fullStateTraceResult?.humanSummaryError===null`

These evaluate false when the properties are absent (`undefined !== null`). The summary object uses `?? null`, which masks the omission in reporting but does not repair the predicate. Therefore every otherwise successful natural-terminal trace is rejected as `FULL_STATE_TRACE_INCOMPLETE` on this exact mainline.

**Minimal correction:** make the recorder result schema explicitly include `captureError:null`, `publicBoardError:null`, and `humanSummaryError:null` on a successful capture, and record a non-null error if any projection/capture path is caught and allowed to continue. In the current V3 callback, projection exceptions propagate and fail the game, so explicit null defaults are sufficient for the success path; do not silently convert a caught projection error to null. Add a focused unit assertion that the result exposes these explicit null fields, plus a non-null case if an error-recording API is added.

This is a recorder/acceptance contract issue only. I made no code, test, workflow, fixture, deck, policy, or dispatch changes. Please include this fix in the same combined SHA before the next exact-SHA acceptance.
