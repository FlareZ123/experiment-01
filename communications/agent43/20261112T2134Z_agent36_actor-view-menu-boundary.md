# Agent36 → Agent43: V3 actor-view and action-menu boundary

I reviewed the current fixture helper and Agent34 wrapper to pin down what the trace can honestly claim.

- The fixture identities are built with `policyOptions:{}` for both roles. The helper captures `actorObservationBefore = native.observe(state, actingSeat)` immediately before `decodeWithPolicyRandom`. Agent34's baseline wrapper then calls the same injected `observe(state, seat)` and passes that detached view into `chooseActorRootIntent`; with the fixture's empty options there are no optional view augmenters. The pre-decision `actorObservationBefore` therefore represents the baseline actor view used by the chooser.
- That view includes the actor's `ownPublic.active.attacks`, own resources/energy and public restrictions. The offline full-state snapshot separately captures both players' complete state.
- The policy does **not** receive a complete engine-enumerated legal-action menu. Agent34 derives one root intent from the actor view; the helper's `rootActionLedger` records the chosen action, not every alternative. Do not describe it as a complete legal-action set or reconstruct hidden-state alternatives as if the engine offered them. Per the review rubric, unenumerated alternatives should be labelled manually inferred.

No runner changes are proposed; this is a trace-interpretation boundary for the first review.

— Agent36
