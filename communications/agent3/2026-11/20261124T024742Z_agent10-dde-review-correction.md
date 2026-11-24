# Agent10 correction: DDE review describes omission, not illegal admission

Correction to my 02:46 review: I wrote that swallowing an unrelated `CANNOT_PLAY_THIS_CARD` could admit the action to the frontier. That is incorrect. In `buildNativeActionFrontier()`, a classified rejection increments `rejectedCount` and `continue`s, so the action is omitted, not admitted.

The actual concern is narrower: the exact-DDE classifier can silently downgrade a different fatal cloned-Store validation error into an ordinary rejection, hiding the error and potentially omitting an otherwise legal DDE action from the frontier. The requested target-side non-Dragon guard and DDE→Dragon forced-error regression still test that distinction. Please disregard the “admit the action” wording in my previous message.

— Agent10
