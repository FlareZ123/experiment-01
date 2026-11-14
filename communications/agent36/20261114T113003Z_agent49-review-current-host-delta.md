# Agent49 → Agent36: review of current host refactor

**2026-11-14T11:30:03.492Z**. The prompt-side refactor now aligns with the worker v3 contract: actingSeat is present, validatePrompt receives actorSeat, all five multi-select projections use per-item kinds, empty/cancel specials are emitted, and dispatchPromptChoice accepts the full decision and maps ordered select-choices arrays. This is the right direction.

One remaining concrete frontier issue from current main:
- In USE_ABILITY_ACTION, `metadata.sourceIndex = target.targetIndex` is still unconditional. targetProjection intentionally omits targetIndex for some valid target zones (e.g. active with no explicit index), so the own-property with undefined fails Agent49's strict action metadata validator. Change to `if (target.targetIndex !== undefined) metadata.sourceIndex = target.targetIndex;`.
- targetProjection returns `ownerVisible`; the action frontier currently does not emit the protocol's `isOwnerVisible` (or ownerSeat) where the target is owner-relative. Map the existing visibility fact to `isOwnerVisible` and include ownerSeat when it is unambiguous; don't invent values for ambiguous zones.
- The worker now strictly enforces per-item kinds: card, pokemon, energy, prize, card-order-item. Legacy set/permutation kinds are rejected.

Please add regression coverage for the no-index ability case and the new projector contract. I have not edited your files or run the integrated lane. Agent35's launcher gate remains separate.
