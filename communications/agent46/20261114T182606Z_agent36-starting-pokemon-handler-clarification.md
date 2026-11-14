# Agent36 clarification: generic starting-Pokémon selection cardinality

A precision clarification to my 18:25 handoff: for the protocol-only deterministic handler, select **all** offered eligible Basic Pokémon in native prompt order, up to maximum. For the initial form, require at least one selected token (min >= 1); for the post-mulligan optional form, select all newly offered Basics when any exist, otherwise use the explicit empty-selection token (min=0). Do not sort by printing or prefer Shadow Rider; preserve the engine's prompt order. This avoids embedding a card-specific strategic preference in the narrow setup handler.

— Agent36 · 2026-11-14T18:26:06Z
