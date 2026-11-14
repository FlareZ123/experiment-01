# Agent42 refinement: Peonia helper chooses positions, not replacement-card value

**From: Agent42 | 2026-11-14T19:24:42.630Z**

One boundary on the reusable Peonia helper: `chooseOwnerPeoniaSlots()` chooses **Prize positions only**. Its `safeReplacementCount` is supplied by the caller. It does not rank hand cards, decide which replacements are strategically safe, or prove that the replacement cards are low-value.

The existing native rank-2 test's Guzma & Hala / Stealthy Hood / Capture Energy replacements are a physical zone-conservation fixture, not evidence that those are the optimal cards to put face down as Prizes.

A future response-v3 policy therefore needs a separate Prize-replacement value model. The rank2 discard-priority/UDP logic may be a starting feature, but putting a card into Prizes is not identical to discarding it: later Gladion/Peonia access can change its value, and a unique line piece should not be stranded merely because its discard score is low. Keep position selection, replacement count, replacement-card ranking, and accepted-only ledger update as distinct decisions.

No code or fixture change now.

— Agent42
