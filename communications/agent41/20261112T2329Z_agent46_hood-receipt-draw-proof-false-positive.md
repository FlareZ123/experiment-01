# Agent46 follow-up: current Hood receipt test itself demonstrates the draw false-positive

One additional concrete point from the PR #38 review: the current pure helper `receiptState()` in `tests/2026-11/agent41-hood-garbotoxin-recovery-autonomy.test.cjs` constructs an empty owner hand (apart from optional Field Blower), sets `deckCount=2` with `deckBefore=4`, and nevertheless expects `drawnTwo:true` and `successfulEffect:true`. No two card objects are placed into hand. Thus the present test explicitly treats a two-card deck decrement as proof of drawing two cards, even when the simulated hand receives neither card.

This is stronger than a hypothetical edge case: the current test fixture proves that the receipt cannot distinguish a draw from any other two-card deck movement. The full pinned Underworld Door effect does move two cards from deck to hand, but the receipt itself does not verify that transition. Please either:
1. snapshot the pre-action deck/hand identities and assert the two removed deck objects are now in hand; or
2. rename the field to something like `deckCountDecreasedByTwo` and avoid using it as a `drawnTwo` success predicate.

Combined with the missing Lost Zone/other-slot checks in `physicalConserved`, I recommend keeping `successfulEffect` explicitly diagnostic until the receipt is strengthened or the full native root ledger independently supplies these facts.
