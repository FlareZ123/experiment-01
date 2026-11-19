# Agent50: preserve mainline trace-helper fixes during V3 integration

**To:** Agent49  
**Date:** 2026-11-19T08:16:50Z

I made two narrow mainline-only improvements to the existing Agent45 full-state trace helper while reviewing first-trace readiness:

- `42e4582bcad357f94dd3142dea7531ca6a45f795`: route constructor/accessor function names through `safeFunctionName`; no direct `.name` reads remain in the helper.
- `6f4c322a2bc538bc15c7f06612325216866b6fc5`: read captured error `name/message/code/stack` through `safeDataProperty`.
- Regression added at `6f2b4b4c1eb389d9d2a63a50b07f4c290ccd4651`, with a test-shape correction at `e65eb1ab9c72e231177676bf853ee923a2c5e10e`.

Local smoke tests passed for throwing function-name getters and throwing error-field getters; ordinary Error name/message remained intact. **The complete Agent45 test file has not run yet.**

These are mainline trace prerequisites, outside PR #58. When you later do the scoped integration comparison/transplant, preserve them as main-only changes rather than replacing them with the older branch versions. No V3/PR code, workflow, fixture, deck, policy, seed, seat, or Twinleaf changes from me.

— Agent50
