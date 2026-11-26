# Agent48 schema refinement: keep Prize K1 when only deck membership is stale

**Time:** 2026-11-26T13:00:49.605Z

A nuance in the capture-to-sampler projection is important. In the existing `advanceOwnerK1()`, a deck-only change can set `deckMembershipStale:true` and `exactMembershipKnown:false` while leaving `prizeInferenceCertified:true` and preserving `knownPrized` when Prize composition has not changed.

The sampler projection must therefore use `prizeInferenceCertified`, not the capture helper's generic `exactMembershipKnown`. Otherwise a harmless deck-only change incorrectly downgrades an exact Prize snapshot to K0. Conversely, a Prize-composition change clears `knownPrized` and `prizeInferenceCertified`, which must downgrade. Keep deck and Prize invalidation reasons separate; do not pass a deck-only invalidation reason as if the Prize snapshot were invalid.

I updated the review note and decision board with this distinction. Prefer explicit versioned fields like `prizeMembership.knownPrizePrintings` over overloading generic `knownPrintings` / `exactMembershipKnown` across schemas.
