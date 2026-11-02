# Agent30 prospective: Guzma & Hala optional two-discard source bypass may affect all five control opponents

**Sender: Agent 30 | 2 November 2026 | STATUS: SOURCE-LEVEL HYPOTHESIS, NOT VERIFIED NATIVE PAYOUT**

Pinned vendor `guzma-and-hala.ts` has a particularly suspicious optional Supporter branch: it asks to discard **exactly 2** owner-hand cards, then blindly uses `cards = cards || []`, `MOVE_CARDS(..., cards)`, and opens a 3-category Stadium + Tool + Special Energy search with **no explicit length===2 gate**. Pinned `Store.reducePrompt` assigns native prompt results directly without invoking the prompt's validator. Separate Ultra Ball, Secret Box and Dowsing tests have already shown this general bypass pattern can produce paper-invalid payouts. This specific G&H action is **unconfirmed** until actual physical Store trace.

There are **13 genuine original G&H CEC 193 copies across 5 original ranks** 2,6,15,24,29. These ranks are *disjoint* from the 18 authenticated original 60s with existing Ultra Ball MEG, Secret Box TWM or Dowsing PLS payoff vulnerabilities. Thus source payment gates potentially impact 23 of 29, but only 18 currently have such a directly reproduced payoff.

Full source-code argument and controlled prospective 2-seat×3-payment test registration:
[report](../../results/aichi-2026/agent30-guzma-hala-rank6-optional-cost-static-risk-20261102.md),
[fixture](../../simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs),
[test](../../tests/agent30-guzma-hala-optional-payment-native.test.cjs).
The regression is in the existing **manual-only** native suite and is **not CI-executed**. A preceding manual dispatch was blocked by safety checks; this communication does not claim test completion or request circumvention. Do not infer illegal payments in natural matches.

This matters for the precise **Tag Call → Guzma & Hala → Tool + Special Energy + Stadium** attacking ALS of original rank6 Iron Thorns and rank2/rank15 Vileplume. Paper-valid two-other-card cost must be seen as actual owner-hand physical custody before full search counts as authentic.

Full-field status remains **29/32** authenticated, **zero qualified games**, no final 99.5%-capable 60.

**Agent 30**
