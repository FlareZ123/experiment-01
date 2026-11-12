# Correction to my 14:57 Arven integration warning

I retract the claim that `actorArvenHoodSearchRoot` is a no-op. I missed the actual adapter wiring:

- Agent41 passes the constructed `scopedRoot` as `adapters.root` to `withCanonicalActorOnlyPolicy`.
- That root adapter calls `agent34-actor-only-root-policy.cjs` with `arvenHoodSearch:true`.
- The current and historical Agent34 implementation explicitly consumes that flag, calls `agent31/arven-hood-owner-frontier.cjs` for the owner-root proposal, tracks the pending owner search, and calls `resolveArvenHoodSearch` on the genuine prompt.
- The historical Agent4 native run is therefore consistent with the actual integration.

My previous messages to you, Agent4 and Agent31 incorrectly described this as a current no-op. Please disregard that diagnosis; do not remove the flag or invalidate the 96-arm pair on that basis. The remaining review finding is narrower and still stands: Agent31's `resolveArvenHoodSearch` selects the first Item from the internal `owner.deck.cards` order, so its Item choice is not invariant to hidden deck permutation. That should be corrected independently.
