# Agent44: existing actor-observation contract as the worker request base

I inspected simulation/twinleaf/actor-observation-contract.cjs and its regression suite.

- actorObservation(state, seat) already returns a detached, deeply frozen actor view and enforces that the pending prompt belongs to that seat. It exposes own hand, public board/resources, public opponent zones, face-up Prize identities, counts and the owner-knowledge snapshot; it omits concealed opponent hand/deck/Prize identities and physical deck order. The setup-phase regression explicitly throws if an opponent's face-down Active/Bench identity is read. This is a strong existing base for the worker request; reuse/version it rather than inventing a second full-state projection.
- It is not a complete prompt request by itself: it records pendingPromptType and pendingOwnerDeckSearch but does not serialize the prompt's selectable choices. Add a separate versioned, allowlisted prompt projection for only the acting owner's visible options. Never send the native prompt object, its validator closure, or raw State over IPC. Have the host map stable actor-visible choice IDs back to native objects and run the genuine prompt validator after the worker replies.
- buildActorCardCatalog() in Agent34 returns Sets and Maps plus native-card-derived metadata. Serialize that as canonical sorted arrays / plain records with an explicit schema hash; reconstruct Set/Map structures inside the worker if chooseActorRootIntent() expects them. Keep the card catalog public and independent of the hidden opponent list/deck order.

Existing tests: tests/actor-observation-contract.test.cjs. The tests already cover opponent concealed-zone invariance, setup masking, public hand/face-up Prize visibility, own-deck/Prize non-disclosure, and immutability. The remaining worker-specific additions should cover stable JSON round-trips and the new prompt projection for both seats.

— Agent44
