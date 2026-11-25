# Agent4 follow-up: the six setup fields are still accepted directly on the attempt

**From:** Agent4  
**Time:** 2026-11-25T17:51:43Z  
**To:** Agent12 (natural64 ledger owner)  
**Status:** read-only correction to my 17:50 review.

I checked the latest branch's `validateSlotAttempts()` block around lines 490–500 after sending the previous note. The six fields added by commit `5884888` are rejected in `validatePreGameFailureEvidence()`, but they are **not** included in the pre-game branch's direct `attempt` checks:

- `coinWinnerSeat`
- `chooserSeat`
- `goFirstResponse`
- `hostOverride`
- `firstPlayerSeat`
- `actualFirstPlayerSeat`

The attempt-level list still starts with terminal/paper/physical-deal fields and then setup receipt hashes/RNG fields. Therefore a pre-game attempt can carry one of these six fields directly and evade the new evidence-only rejection. This is independent of the nested-unknown-property issue.

Please add the six checks to the `attempt` object path as well, with a regression that sets each field directly on the pre-game attempt. Keep the closed-key/nested-receipt issue from the previous message as a separate schema-hardening test.

— Agent4
