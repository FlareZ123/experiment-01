# Agent2 — focused review of rank-1 v3 repair head

**Reviewed:** PR #70, exact head `3b071e4b57c26f9db7ccecd45c9ce4f4d5f8f1f2`  
**Policy blob:** `ef555cf7280ceea6261877b85fc85a3fdf9445f8`  
**Test blob:** `8d6a53b0147b0fd0e3637b09462cc5b6e1d5544c`  
**Scope:** changed Quick Ball, Gate-lock, Fairy Zone and Field Blower behavior only. No fixture or game was run.

## Confirmed repairs

- The valid Quick Ball mandatory-payment path is correctly separated from the subsequent deck-search phase. The current prompt projector constructs the required actor-hand zone/owner, count bounds, cancellation flag, source identity, and prompt description for a normal owner-hand `ChooseCardsPrompt`.
- The added Gate checks are consistent with the printed scope of Path to the Peak, Silent Lab, Active Klefki, Wobbuffet, Iron Thorns, opponent-Active Neutralizing Gas, board-wide Power of Alchemy, Tool-equipped Garbotoxin, and opponent-Active Slaking. The opponent-only scope of Neutralizing Gas/Slaking is correctly distinguished from own-Active copies.
- The Fairy Zone public-source resolver's tested suppressors and listed card-specific exemptions are consistent with the supplied English card texts. The Active-only Flutter Mane check is appropriately scoped to Clefairy occupying the actor's Active Spot.

## Required correction — Quick Ball discard-phase fail-open

At policy lines 1384–1403, the special discard branch runs only when every metadata predicate matches. If the prompt is still a Quick Ball `CHOOSE_CARD_TO_DISCARD` prompt but any one of those metadata fields is absent or differs (for example `ownerSeat`, `sourceZone`, `allowCancel`, or exact source printing), execution falls through to the generic card-combination branch at lines 1522–1544. That branch explicitly accepts Quick Ball as a known search source and calls `cardSearchScore()`; the latter gives Shadow Rider V/VMAX retrieval scores. This recreates the original payment/search inversion precisely on an incomplete or slightly changed prompt projection.

Please add a fail-closed Quick Ball discard-phase guard before the generic card-combination handler: once the source/description identifies a Quick Ball discard prompt, never route it through retrieval scoring. If the full actor-owned, hand, 1-of-1, non-cancelable contract is not satisfied, return a typed unsupported/abstain result (or a separately validated safe payment fallback). Add a regression with the discard description but one missing/mismatched metadata field, and assert that V/VMAX are not chosen via search scoring. Keep the valid discard and subsequent deck-search tests.

## Evidence and reporting alignment

The latest Fairy Zone resolver changes the earlier disposition: when the actor projection has no explicit suppression status, `fairyZoneActive()` now infers activity from the absence of its enumerated public suppressors. The current report still says the live policy remains fail-closed and does not assume Fairy Zone active from printed text. Please update the report to describe this as a public-state, enumerated-suppressor resolver, state its coverage boundary, and retain the caveat that it is not a native observation certificate.

The current PR head is `3b071e4...` with 105 policy tests. The published contract receipts in the report are tied to earlier head `b5551c34...` and 103 tests; I found no workflow run or status check associated with `3b071e4...`. Please rerun the existing contract-only lane on the corrected exact head before requesting disposition. This remains contract evidence only, not independent gameplay competence.

— Agent2
