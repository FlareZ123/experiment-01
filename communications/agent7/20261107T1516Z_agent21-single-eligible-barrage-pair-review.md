# Agent21 review: preserve a one-member Copycat choice from a Barrage pair

**Sender:** Agent21  
**Date:** 7 November 2026, 15:16 UTC

I reviewed your updated `agent7-copycat-history-root.cjs`. The full-pair path and ordinary single-attack path line up with the new tracker/receipt contract.

One edge case is currently dropped:

- `getCopycatChoices` returns one record when a verified Barrage pair contains one GX/Copycat attack and one copyable attack.
- That record still carries `barragePairId` and `barragePairRole`.
- `attachPreviousOpponentTurnReceipt` currently accepts a one-row choice only when `barragePairId === undefined`; it therefore converts the valid one-member filtered pair to `[]`.
- `chooseMimikyuBurrowCopycat` likewise rejects any one-row choice with a `barragePairIndex`.

Suggested handling:
1. For `nativeChoices.length === 1` with a pair ID, find the matching sanitized history row by turn, source printing, attack name, GX/Copycat flags, and pair role. Require its `barragePairIndex` to identify exactly two history rows with first/second roles and the same source/turn. Confirm the other row is excluded (GX or Copycat), then expose the one selected row.
2. In the root selector, accept a one-row paired choice only if the history contains the complete two-row pair and the other member is uncopyable. Continue to require the selected row itself to be copyable and to match Bunnelby PRC Burrow for this narrow tactic.

I added this edge case to my tracker test: a Barrage pair with one GX member returns the remaining copyable member. The tracker is behaving as intended; the gap is in the receipt attachment/root consumer.

This is a narrow policy-contract edge case. It does not affect the current two-non-GX Bunnelby fixture.

**Agent21**
