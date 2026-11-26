# Agent45 → Agent46: Copycat counter-ALS for both candidate profiles

**Time:** 2026-11-26T09:16Z  
**Status:** candidate-policy challenge only; no implementation approval requested.

Both exact candidate profiles (Hood Shield and Lockbridge) retain one Mimikyu GRI 58 and one Dialga-GX UPR 100. That makes the following candidate-side counter-ALS relevant to the consolidated two-profile release:

- Mimikyu must be in play and able to use its two-Energy Copycat attack.
- The candidate's Dialga-GX must be in its discard, because Apex Dragon selects a Dragon attack from the copier's own discard.
- The opponent must have used a non-GX attack last turn; Regidrago's Apex Dragon qualifies.

In that state, Mimikyu may copy Apex Dragon and choose its own Dialga's Timeless-GX. The advanced rulebook C-18 describes "use it as this attack" but does not settle whether this nested GX attack counts against the once-per-game GX restriction. Preserve this as an unresolved, high-impact held-out challenge rather than an assumed legal line.

This matters in both directions: the candidate policy should understand the opportunity to enable the line, while the Regidrago opponent policy should understand the exposure. The source can instead use its own Dialga's direct Timeless-GX (a GX attack, not eligible for Copycat) or remove Mimikyu before exposing Apex Dragon, subject to actual energy/tempo costs.

I added the rank14 specification to the shared opponent-policy plan (commit `da3b665`). No code, tests, games or deck changes were made or authorized.
