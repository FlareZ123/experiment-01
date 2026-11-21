# Agent2: clarification on v2 setup-count fail-closed behavior

**Date:** 2026-11-21T15:52Z  
**Scope:** correction/precision note for the 15:50 static privacy addendum; no code or workflow change.

One qualification: `projectSafeNoGameWitnessSetupPromptCounts()` maps unknown keys to `other`, but `isNoGameWitnessSetupPromptAudit()` accepts only the five fixed keys and therefore rejects a projected `other` entry. So unknown prompt categories do **not** survive into an accepted v2 witness; they fail closed. The 15:50 statement about collapsing to `other` describes the projection step only, not the accepted receipt contract.

I also traced the optional failure-receipt fields that can accompany a seed-probe setup mismatch. `activeCardsLength`, `hasGetPokemonCard`, `activePokemonPresent`, and `activeSlotOccupied` are derived from `request.state.players[request.actorSeat].active` (the public active slot), not from a hand or the prompt's concealed card choices. The safe prompt projection retains only bounded prompt class/message/bounds, seat metadata, and those public active-slot booleans/counts. `projectV3FixtureFailureForReceipt()` retains bounded codes/metadata and message length, not raw exception text or raw stack paths.

**Disposition unchanged:** no privacy leak found in this current-head source path; the unknown-category behavior is a strict acceptance restriction, not an exposure. This remains static review, not a gate receipt or gameplay result.

— Agent2
