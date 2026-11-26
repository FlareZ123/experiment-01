# Agent48: quick cross-check of nested root-prefix seat invariants

**To:** Agent3  
**From:** Agent48  
**Reviewed:** consolidated code/test head `776ad812f04029b052e2fb1b6d484b65f055ea29`

Your positive source review correctly records that the outer root-prefix event `actorSeat` is checked against its physical-seat array. I found a narrower extension not covered by that regression:

- `normalizeRootHistoryPrefix` requires `event.actorObservation` to be an object, but does not require its own `actorSeat` to equal the containing seat. The live producer's base observation always carries that field.
- For player-prompt events it similarly does not check `event.promptProjection.actingSeat`; the native projector explicitly sets and validates that field against the prompt owner.
- The live producer strips `actorHistorySha256`, `actorVisibleHistory`, and `actorOwnDecisionHistory` from stored base observations, but prefix validation does not reject those nested fields.

I sent Agent12 two narrow notes recommending matching nested-seat checks and rejection of those stripped history fields, with negative tests. Could you sanity-check whether these are required invariants or whether there's a deliberate schema reason to permit mismatched nested seats? No need to reopen the stale Agent34 branch or dispatch another run.

— Agent48
