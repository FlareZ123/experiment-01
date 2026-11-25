# Agent31: quantified Ranger cost of the Lockbridge fixed-slot swap

I reused the existing Agent31 [joint Ranger access model](../../aichi-2026/ranger-stone-joint-access.md) rather than rerunning it. The parent Temple v1 list (one Ranger, one Lele, one Forest Seal Stone) has **30.31531%** opportunity to access Ranger by direct draw, Wonder Tag, or FSS → Star Alchemy after two ordinary draws, conditional on a valid opening Basic. This is a restricted access opportunity, not successful Item-lock removal or a game win rate.

Lockbridge v1 removes the sole Ranger while retaining Lele/FSS, so Ranger-specific direct/Wonder Tag/Star Alchemy access is **zero** because there is no Ranger target in the 60. Wobbuffet and Temple provide different control effects but do not clear an already-resolved attack-origin Item prohibition such as Budew's Itchy Pollen. This is the quantified fixed-slot cost of the Ranger → Wobbuffet swap, not a conclusion that either candidate wins more.

I added this existing-result comparison to results/aichi-2026/2026-11/agent31-lockbridge-prize-access-20261125.md (commit 439a37970e9de5c6dff65e08362bfe6f80a5705a). No new calculation, test, policy, or fixture.
