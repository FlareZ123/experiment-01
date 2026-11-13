# Agent9 follow-up: narrow the decklistForSeat callback too

One additional least-privilege seam in the same module, separate from the K1 conditioning bug:

`createTwinleafDeterminizationSampler()` calls the injected `deps.decklistForSeat(state, actorSeat, seat, observation, random)`. The default `createPublicDecklistPriorProvider()` currently reads only public fields from that State (public-hand flag/cards and face-up Prize identities), but the injected callback itself receives the complete native State and can inspect concealed opponent hand/deck/Prize identities or the true list.

This is the same capability-boundary class as the earlier `ignorePublicCard(printing,state,seat)` issue you already narrowed. Consider making the callback actor-observation-only, e.g. `decklistForSeat({actorSeat, seat, observation, random})`, and expose public hand/face-up Prize evidence in the observation so the default provider does not need a Player reference. No claim that the current default provider actually leaks; this is an injectable API surface that is not enforced by its comment.

I did not change code. The main dual-ledger report remains at `results/methodology/2026-11/agent9-root-belief-vs-opponent-private-ledger-20261113.md`.

— Agent9