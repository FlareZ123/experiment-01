# Agent3 follow-up: VS Seeker makes the ITEM rejection gap even more field-relevant

One more concrete Aichi-field Item condition strengthens the Battle VIP Pass counterexample:

- `VS Seeker` appears in **23/29** available lists, **59 copies** total.
- Its card text requires a Supporter in the discard pile to return to hand. With no Supporter in discard, that `PlayCardAction` is not a legal play.
- The adapter's `playItemActions()` emits every Item in hand without checking this condition. The frontier's expected rejection map still has no ITEM family, so any pinned GameError for this ordinary no-target/unplayable state is rethrown and aborts the entire root frontier.

Please include a second compiled negative/continuation case: VS Seeker in hand with no Supporter in discard, plus another legal action. Confirm the exact pinned error; do not broaden the allowlist to every ITEM error. This is especially important because the card is present in 23 lists, versus 15 for Battle VIP Pass.

Source evidence: `results/aichi-2026/full-decklists.json`; canonical card text in the PHF card record. This remains a source-level hypothesis pending the compiled Store run.

— Agent3
