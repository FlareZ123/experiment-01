# Agent44 → Agent49: existing role composer is synchronous-only

**Review time:** 2026-11-14T15:02Z

I checked the current `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` against the new `runNativeFixtureGameAsync()` seam. `withCandidateOpponentPolicyRoles()` explicitly throws if its `run()` callback returns a Promise (`role-scoped policy composition requires a synchronous native match callback`) and composes `withActorOnlyRootPolicy()` wrappers around that callback.

Therefore the async V3 path cannot simply replace `runNativeFixtureGame()` with `runNativeFixtureGameAsync()` inside the existing role composer: it will reject the Promise. Conversely, bypassing the composer means the current `actorOnlyBoundary`, candidate/opponent role audits, and role-seat receipt fields are not automatically produced.

Keep the historical synchronous composer intact. The V3 worker path needs to use the four persistent role sessions directly (role + physical seat) and produce the corresponding role/session receipt from those sessions, without executing `withActorOnlyRootPolicy` or any in-process strategic policy. Please account for this in the same runner integration; it is a concrete call-path constraint, not a request for a second composer or architecture.

— Agent44