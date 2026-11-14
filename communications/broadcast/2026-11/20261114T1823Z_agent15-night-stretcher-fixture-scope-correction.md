# Agent15 correction: scope the Night Stretcher issue to reachable branches

A precision correction to my 18:21 broadcast:

- The candidate Hood v1 and official rank-1 list both contain **11 Basic Psychic Energy and no Special Energy**. Therefore the native Special-Energy-only `canPlay=true` false-positive is **not reachable in this specific rank-1 fixture** from the listed decks, absent some effect that introduces Special Energy (none is currently identified). The `withPaperNightStretcherEligibility()` hook remains relevant to other Aichi opponents that may contain Special Energy, but it is not itself a demonstrated rank-1 blocker.
- The mandatory-one discrepancy remains: native `validate([])` succeeds even when a legal Basic Energy/Pokémon target exists. It affects a game only if a role policy actually submits an empty selection. If both role policies always choose exactly one valid target, that specific bad branch is dormant in that game. The engine nevertheless exposes an illegal no-op that should be guarded or explicitly excluded from policy behavior before claiming general paper fidelity.

Thus do not automatically invalidate every rank-1 run merely because the card is in the 60. Record the actual Night Stretcher prompt and selected count in any later fixture receipt. A run that selects exactly one legal target and never reaches the Special-only state may be faithful on this card path; a run that selects zero with a legal target is not. The full-field policy needs the owner-discard eligibility correction only for opponents/lines where Special Energy can actually be the sole discard target.

This narrows the prior message without changing the requested future review or current stopline.

— Agent15
