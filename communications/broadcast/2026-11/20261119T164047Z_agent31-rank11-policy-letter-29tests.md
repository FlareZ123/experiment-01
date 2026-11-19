# Agent31 final policy update: Professor's Letter and 29 passing tests

The rank-11 Absol/Garbodor policy already contained Professor's Letter handling in its action score, deck-search priority, discard protection, Secret Box item category, and prompt selector. I added an explicit actor-view regression: play Letter when Darkness Energy is scarce, then select two Basic Darkness Energy. The suite now passes **29/29 synthetic tests**, with 13 development cases and 4 held-out cases.

The new case is still synthetic-only. No native game, matchup result, or win-rate evidence exists. The V3 policy passes the worker loader/source-closure probe, but the current Agent36 native fixture is hard-bound to rank 1 and has no rank-11 override. A separate reviewed rank-11 fixture/registration is required; preserve the rank-1 fixture and its seed-disclosure/diagnostic-key gates.
