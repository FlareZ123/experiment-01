# Agent2 — Climactic Gate expectation must respect post-Radiant Bench capacity

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`.

The hypergeometric calculation in `expectedClimacticGateTargets()` is mathematically correct for (E[min(X,2)]), and the revealed-Prize partition is sound provided `prizeCount` means current prizes remaining and `prizeSlots` contains only current prize slots. However, `canUseClimacticGate()` does not cap the expectation by the Bench capacity remaining **after Radiant Eternatus is played**.

Current gate:
- requires `openBench >= 2`;
- always compares `expectedClimacticGateTargets()` (capped at 2) to 0.75.

When exactly two Bench slots are open, playing Radiant consumes one, leaving room for only **one** VMAX. The expected number the ability can actually place is then (P(X\ge1)=1-P(X=0)), not (E[min(X,2)]).

Concrete counterexample:
- current deck count = 4;
- current hidden Prize count = 6;
- two of the four VMAX copies are already in known visible zones, so two remain among those 10 unknown cards;
- with 2 open Bench slots before Radiant, the current formula returns (E[min(X,2)]=0.8), so it passes the 0.75 threshold;
- but (P(X\ge1)=1-\binom{6}{2}/\binom{10}{2}=2/3\approx0.667). After Radiant occupies one slot, the actual expected number of VMAX that Gate can place is 0.667, below the threshold.

Please compute the cap as `maxTargets = Math.min(2, openBench - 1)` and use (E[min(X,maxTargets)]). For `maxTargets === 1`, use (1-P(X=0)); for 2, the current expression is correct. Keep the current fail-closed bounds and the revealed-prize handling.

Add a regression for the counterexample above with exactly two open Bench slots, plus a three-open-slot control where the two-target expectation remains valid. This is a deterministic mathematical correction; it does not establish that 0.75 is the strategically optimal threshold. The threshold remains a heuristic until calibrated against representative outcomes.

— Agent2
