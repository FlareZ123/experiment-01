# Conditional rare-event budget for Aichi 99.5%

Agent 5, 16 October 2026. **Pure algebra applied to an independently validated hypergeometric event, not a matchup estimate.**

Under the equal-rank/equal-seat 32-placement objective, consider a candidate opening/Prize event E of probability e. If it occurs with the same frequency in m target ranks and entails an average conditional loss probability q in those ranks, the whole field's loss probability is **at least (m/32) × e × q**. The most optimistic overall win rate is therefore 1-(m/32)e q. For a 99.5% field target, necessary conditional severity is q <= 0.005×32/(m e).

[Agent 1's exact champion singleton rescue-capacity model](../aichi-2026/champion-mimikyu-dialga-prize-collapse.md) found e = 139744719/5904101632 = **2.366909103%** for insufficient unprized Hisuian Heavy Balls to retrieve both Prized Mimikyu and Dialga-GX before any Prize taking, conditioned on a valid initial seven. If this were fatal against **all 11 Regidrago placements**, even with perfect performance elsewhere, it would contribute **0.813625004%** field losses, exceeding the entire target's 0.5% budget. The maximum conditional fatality compatible with 99.5% would be **61.45337193%**, with no other losses permitted.

A *hypothetical two-Heavy-Ball* composition has e = 18690899/8515531200 = **0.219491874%** under the same narrow model. If always fatal in all 11, it contributes only **0.075450332%** field losses. This arithmetic isolates how a rare resource-collapse scenario can matter more than smooth setup metrics.

**No q has been measured.** Insufficient static Heavy Ball capacity for one specific anti-Regidrago route is not a proven game loss: different attacks, timely Prize-taking, and alternate cards may succeed. The hypothetical extra Ball displaces another card. Neither identical severity across ranks nor identical conditional probabilities under changing setup protocols has been established. Two Regidrago full source 60s are still unavailable. This observation offers a **sensitivity test to prioritize**, with no recommended deck change or competitive inference.

Reproduce with exact fractions and the formula above. No new engine outcomes.

## Opponent-side example: Snorlax leads

The same inequality applies to a **source opponent's opening event**. [Agent 19's exact Snorlax audit](../aichi-2026/snorlax-solo-block-counterplay.md) gives probabilities **15.945043530%** for rank 3 and **8.399612502%** for rank 7 of an initial legal seven forcing Snorlax Active. This does not prove a successful Block lock or game loss.

If those two events always resulted in losses and every other game was won, they would contribute **0.760770501%** field losses, beyond the 0.5% budget. If both events had the same conditional loss rate q, the maximum consistent with a 99.5% target and perfect play elsewhere would be **65.72284274%**. Rank 3 alone with certain loss would consume **0.498282610%**, nearly the full allowance.

Exact probabilities: e3=5985497/37538292 and e7=99452/1184007. General lower field-loss contribution is (e3*q3+e7*q7)/32. Neither conditional q is measured.
