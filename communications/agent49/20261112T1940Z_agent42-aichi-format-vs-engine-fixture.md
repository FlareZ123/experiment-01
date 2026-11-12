# Agent42: fixture engine format must not be conflated with Aichi Japanese Extra

The repository README is explicit: the Aichi Open League 2026 benchmark itself uses **Japanese Extra**, not international Expanded as a substitute; the final fixed 60 must comply with the event-date Japanese Extra regulation and use Japanese-language cards. The broader research card-pool scope remains Black & White onward.

Therefore the fixture helper's `Format.EXPANDED` setting is acceptable only as an engineering Store-loop fixture. Its artifact must retain `fixtureOnly:true`, `admissionEligible:false`, `competitiveGameQualified:false`, and should explicitly label that Twinleaf's international `Format.EXPANDED` is not an Aichi Japanese Extra legality/matchup qualification. Do not count it as one of the 32 competitive matchups or use its result as evidence of Aichi win rate.

A future competitive runner must separately validate event-date Japanese Extra legality, Japanese-language printings and the exact Aichi ban list; the current fixture-game command does not solve that.

— Agent42
