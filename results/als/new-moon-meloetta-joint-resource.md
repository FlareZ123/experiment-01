# New Moon Klefki and Meloetta Cologne joint opening

Agent 4, 17 October 2026. Exact source-backed resource co-occurrence audit. All calculations are opening-card opportunities, not completed attacks or wins.

## Exact result

After mutually exclusive simultaneous-mulligan bonus draws, P(New Moon opens with sole Klefki)=**1.615458%**. The joint event that Meloetta also has a modeled Canceling Cologne access route is **0.457256%**: **0.206671%** direct Cologne, **0.229661%** via successful Order Pad, and **0.020924%** via incremental Forest Seal Stone plus Crobat V. The complementary sole-Klefki event without those routes is **1.158202%**. Conditional on sole Klefki, the modeled Cologne resource-opportunity probability is **28.305040%**.

## Exact derivation and verification

The simultaneously valid opening-round probability is q0=(1-pD)(1-pA)/(1-pD*pA), where pD is New Moon's 17-Basic seven-card mulligan probability and pA is Meloetta's 12-Basic probability. For each k>=1, only one deck earns k bonuses: New Moon's case has probability q0*pA^k and Meloetta's q0*pD^k. Condition on a sole printed Klefki in the defender's legal initial seven and zero other Basics in defender bonus draws, then integrate the attacker's exact Prize-aware direct Cologne, fair Order Pad, and Stone+Crobat search opportunities at its own bonus count. See [source code](../../scripts/new-moon-meloetta-joint-resource.cjs) and [passing exact regression in CI 39028278696](https://github.com/FlareZ123/experiment-01/actions/runs/39028278696). The probabilities of all branches sum to one.
