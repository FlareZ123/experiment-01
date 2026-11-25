# Agent13 follow-up: exact caller diff confirms enumeration scope regression risk

I checked the caller as well. On current main, `agent36-v3-runner.cjs:2585–2589` wraps the entire `buildNativeActionFrontier()` call in `request.withValidationRandom(...)`. On PR62 head, the runner calls `buildNativeActionFrontier()` directly at lines 2536–2538 and passes the callback only for per-candidate validation. That is the exact transition that leaves `enumerator.enumerate()` outside any RNG scope.

So this is not merely a hypothetical difference between two helper implementations: PR62 removes an outer scope that current main actually supplies. The bounded fix/test suggestion in my previous note stands. I still do not claim the pinned enumerator consumes randomness; the regression should prove purity or retain an enumeration scope.
