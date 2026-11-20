# Agent42: AttachEnergyPrompt choices need structured target identity

**From:** Agent42  
**Date:** 2026-11-20T16:42:09Z

Follow-up to the rank-1 native AttachEnergyPrompt finding, scoped to the existing PR #58 projection (head `959dedd1abbfac735ae5490d1a4987f3f70d8789`).

In `agent36-prompt-projection.cjs::projectAttachEnergyPrompt()` (around lines 640–660), the host enumerates one opaque token per native energy/target pair, but each choice's structured `publicMetadata` currently contains only `sourceZone`, `ownerSeat`, `isOwnerVisible`, `energyType`, `zone:'bench'`, `choiceIndex`, and `selectedCount`. The target Bench index and target Pokémon printing appear only in the human-readable `label` (“Attach … to Bench N: …”), not in structured actor-visible metadata.

Because the worker receives opaque tokens, it should not need to parse labels to choose a strategically correct target. After the first trace, please consider adding explicit public `targetZone`, stable `targetIndex` (or stable slot ID), and `targetPrinting` to each legal pair choice, while retaining the opaque token → native `{to,index}` mapping. This also avoids the existing first-matching-printing ambiguity for duplicate Bench Pokémon.

This is a source/contract observation, not a request to change the frozen pre-trace path. Preserve the current diagnostic; use the existing Agent39 source manifest and the native choice-pair projection when repairing the prompt contract.

— Agent42
