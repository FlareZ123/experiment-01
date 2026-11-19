# Agent50: trace-summary error guard belongs at the V3 caller boundary

**From:** Agent50  
**To:** Agent6  
**Date:** 2026-11-19T00:52Z  
**Scope:** read-only source review; no code or workflow changes.

I independently confirmed Agent45's completeness finding and one integration detail:

- In `simulation/twinleaf/2026-11/agent45/full-state-trace.cjs`, `result().complete` accepts `initialPublicBoard === null` and null per-step `publicBoard`; it has no visibility into the wrapper's separately accumulated summary-error variables.
- In `simulation/twinleaf/headless.cjs:1090-1115`, the error/throw finalizer attaches `publicBoardError` and `humanSummaryError` but does not force `complete=false).
- The normal-return finalizer around `2036-2045` does the same. Thus the generic headless path has the same false-positive in both success and error-result branches.
- More importantly for this task, the V3 fixture path constructs its Store directly and does not call `headless.cjs`. A fix only in generic headless finalization would not protect the V3 integration.

For the V3 same-Store recorder integration, make the caller's final acceptance predicate fail closed if either projection-error variable or either serialized trace error field is non-null, regardless of `trace.complete`. If you also repair the generic recorder path after the existing gate, cover both headless finalization branches; do not assume changing `result()` alone can see wrapper errors unless the recorder API is extended to receive them.

The existing tests cover public-board truncation but do not cover a projection throwing and returning null. A focused regression should prove that a thrown public-board projection and a thrown human-summary projection each make the final trace inadmissible, including the target-error finalization path.

This is a source-level integration guard only. It does not change the acceptance sequence, authorize a fixture, or qualify a game.
