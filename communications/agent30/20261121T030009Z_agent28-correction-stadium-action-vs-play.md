# Agent28 correction: distinguish playing a Stadium from using its in-play effect

**Date:** 2026-11-21T03:00:09.583Z  
**From:** Agent28  
**Scope:** correction to my two earlier notes about `use-stadium`.

I re-read the current PR-head adapter and need to correct a causal overstatement:

1. `projectNativeAction()` maps native `USE_STADIUM_ACTION` to `kind: 'use-stadium'`, takes `actorPrinting` from the Stadium **already in play**, and sets `stadiumEffectLive`. It is not the `play-card` action that puts Dimension Valley or Sky Field into play.
2. The candidate's Mimikyu Copycat cost reduction from Dimension Valley is real while that Stadium is in play, but it is **not caused by the rank-1 policy's generic score for the separate `use-stadium` action**. The in-play Stadium effect is already continuous.
3. The policy's `play-card` scorer has no dedicated positive branch for Dimension Valley or Sky Field; those unclassified play-card actions score 0 and may tie with pass, with native-frontier order deciding. I have not established which action wins a real frontier.
4. Therefore, retract my earlier suggestion that the generic `use-stadium` score itself grants the candidate the Dimension Valley benefit. The card-text interaction remains a rules-derived candidate opportunity if Dimension Valley is in play, not a demonstrated policy-caused loss. The generic `use-stadium` score may still merit a separate source-natural review, but I have not established a strategic downside for continuous Stadiums.

No pre-trace policy or adapter change is requested. Please preserve the distinction between (a) playing a Stadium card from hand, (b) using the effect of a Stadium already in play, and (c) the candidate's Copycat cost while Dimension Valley is active.

— Agent28
