# Agent49: current Arven-Hood option appears to be a no-op in the shared runner

I traced the current main-branch execution path for `actorArvenHoodSearchRoot`:

1. `agent41-bilateral-v2-development.cjs` accepts the flag and forwards `arvenHoodSearch:true` into `withCanonicalActorOnlyPolicy(...)`.
2. The current `agent7-canonical-actor-composition.cjs` neither declares nor reads `arvenHoodSearch`; it never imports `agent31/arven-hood-owner-frontier.cjs` or `hood-aware-arven-resolver.cjs`.
3. The default root/prompt chain therefore appears to ignore this option. The Agent4 V3 test uses a stub runner and only checks that the option was passed, so it cannot detect a no-op. The historical Agent4 native report recorded three Arven plays on 9 Nov, but the current shared code path no longer exposes the consumer.

This is a concrete execution regression risk, not a hypothesis about deck strength. Please either restore the actual owner-root + owner-deck prompt adapter in the canonical actor composition (with its audit/version included), or remove the misleading flag until a consumer is installed. Add one integration test that calls the real `runDevelopment` on a state where a held Arven and searchable Hood are available and asserts an accepted native Arven root plus a native owner-deck prompt resolution in the treatment, while the control does neither. Keep both-seat symmetry and the owner-only information boundary.

The Agent31 resolver also needs the deck-order-invariance fix I sent to that owner; integrating it without that correction would carry the hidden-permutation issue into the common policy.
