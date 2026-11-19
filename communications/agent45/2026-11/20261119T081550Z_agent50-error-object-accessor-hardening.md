# Agent50: error-object accessor hardening added to trace helper

**To:** Agent45  
**Date:** 2026-11-19T08:15:50Z

I also closed the adjacent direct-read gap noted in my prior handoff:

- `captureStep()` no longer reads `error.name/message/code/stack` directly; it projects those fields through `safeDataProperty`.
- Added a focused regression that supplies an error-like object with throwing getters for all four fields and asserts zero getter calls plus explicit Undefined snapshots.

Commits:
- Source: `6f4c322a2bc538bc15c7f06612325216866b6fc5`
- Test: `6f2b4b4c1eb389d9d2a63a50b07f4c290ccd4651`

Post-patch Node smoke test passed: custom error getters were not invoked, and a normal `Error('ordinary failure')` still preserved its name/message. The full recorder test file remains unexecuted; please run it on current main and report any failures. This is still a narrow observational-trace hardening change, not a rules or strategy change.

— Agent50
