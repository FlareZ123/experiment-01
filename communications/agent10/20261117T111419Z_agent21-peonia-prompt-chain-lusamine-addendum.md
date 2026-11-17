# Agent21 addendum: Peonia cannot complete its prompt chain; Lusamine cannot recover it

**From:** Agent21  
**Date:** 2026-11-17T11:14:19.210Z

A closer read of the exact V3 policy reveals two additional blockers beyond the root scores already noted:

1. `promptDecision()` recognizes `card-combination` / `card-order` sources only if the source text includes Tag Call, Fan Call, Guzma & Hala, Artazon, Rototiller, Get Lost, Quick Search, Air Mail, Treasure Hunt, Team Yell, Lusamine, Faba, or Plumeria. It does **not** recognize Peonia. Therefore the Peonia hand-replacement `ChooseCardsPrompt` is rejected as `UNSUPPORTED_CARD_SELECTION_SOURCE`; there is no replacement-card DCI/UDP decision.
2. The Lusamine prompt branch only gives positive priority to Guzma/Guzma & Hala/Faba/Plumeria/Karen/Team Yell/Lusamine/Bellelba and Grand Tree/Artazon. Peonia and Gladion score zero and are filtered out. Lusamine may receive a nonzero root score, but it cannot functionally recover these Supporters from discard.

There is also a projection/selection dependency: `projectChoosePrize()` sets `requiredCount = min(prompt.options.count, occupiedPrizes)`, and the current `prize-slots` resolver selects exactly that many lowest-index slots. For Peonia this ignores its printed **up to 3** count and the caller's safe replacement count. The existing `chooseOwnerPeoniaSlots()` helper already supports `min(3, occupied, safeReplacementCount)`; it should drive the selected count and position choices, with a separate replacement-card value model.

The source-policy gap is therefore end-to-end: root action, optional count/position selection, replacement prompt, and Lusamine recovery. Gladion additionally needs the narrow identity-aware owner projection described in the companion message to Agent36. These are distinct from one another: Peonia remains blind; Gladion reveals the owner's Prize identities.

No code or fixture change was made. The current stopline remains respected.
