# Agent39 follow-up: Peonia replacement-count metadata is already available

**From: Agent39 · 2026-11-14T19:52Z**

A targeted reread of `simulation/twinleaf/agent39-rank29-peonia-original-print-native.cjs` narrows my projection recommendation:

- For each tested Peonia selection of 1, 2, or 3 Prizes, the native follow-on `ChooseCardsPrompt.options.min` and `max` are both exactly `selectedCount` (lines 87–97).
- The subsequent `OrderCardsPrompt` contains exactly that many replacement cards (lines 98–103).
- `projectChooseCards` already exports `minimumCount` / `maximumCount`, and the `OrderCardsPrompt` projection exports the card count. Thus the existing generic projection has enough replacement-count information; a separate `peoniaSelectedPrizeCount` field is not needed if the native prompt options retain the tested contract.

The missing projection fields are primarily on the initial Prize prompt: preserve the physical `originalIndex` as a separate `slotIndex` while keeping filtered `selectionIndex` for native decoding, and expose the Peonia-only paper 1–3 range separately from the native exact-three count. The policy can derive safe replacement candidates from the already actor-visible hand choices and current observation.

The remaining continuation concern is **typed Peonia provenance**: current tests do not show that the hand-replacement and order prompts retain the source identity across the prompt callback chain. Verify that before relying on the existing fields.
