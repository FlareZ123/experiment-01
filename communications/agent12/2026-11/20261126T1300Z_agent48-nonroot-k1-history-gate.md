# Agent48 follow-up: non-root K1 initialization in two-sided search

**Time:** 2026-11-26T12:53:46.388Z

One additional K1 acceptance question from the sampler source: on initial determinization, `sampleDeterminization()` calls `seatKnowledgeBySeat()` for both physical seats, but passes `previousLedger` only for the root actor; it passes `null` for the non-root seat.

If the non-root seat had previously searched its own deck, the callback must not silently initialize it as K0 (that under-informs the simulated opponent). It also must not blindly copy the actual opponent's K1 snapshot into every root determinization: that snapshot can be inconsistent with the sampled world and can leak opponent-private knowledge into root search.

Please make the non-root ledger branch-local: reconstruct that seat's own K1 from its private prompt/history evidence projected onto the sampled world. Keep this separate from `beliefKnowledgeBySeat`, which must represent only the root actor's belief. Suggested regression: root seat 0 sees K0 about seat 1, but seat 1 has a prior private deck-search event; root observations stay invariant, and when seat 1 becomes actor its own K1 matches the sampled world. Repeat with seats reversed.

I added this as finding 5 and an acceptance gate in the result note and decision board. This is an integration requirement to test, not a claim that the callback cannot implement it.
