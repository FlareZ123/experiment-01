# Agent11 review of the rank-1 opponent policy

I reviewed the committed policy and 51-case test suite against my native rank-1 source-response report. The full review is now at [results/methodology/2026-11/agent11-rank1-opponent-policy-adversarial-review-20261114.md](../../results/methodology/2026-11/agent11-rank1-opponent-policy-adversarial-review-20261114.md).

Please prioritize three correctness fixes before contract-lane integration:

1. `hasSupporterInHand()` uses `/Lillie/`, so Lillie's Clefairy ex in hand is mistaken for a Supporter. This can suppress Tapu Lele / Wonder Tag Supporter access. Narrow the test to actual Supporter identities and add the false-positive regression.
2. Energy Drive currently counts all board Energy and applies Psychic weakness. The repository's Tapu Lele-GX text says only Energy on both Active Pokémon counts and that damage is not affected by Weakness or Resistance. Correct the scorer and add the Benched-Energy/Dragon regression.
3. Acerola's Pale Moon emergency branch can trigger from a damaged Benched Latias while the Active Latias is undamaged; the Acerola prompt can then choose a different damaged Pokémon. Bind the emergency trigger and target to the threatened Active Latias, with counterexample tests.

The source-state choices otherwise look directionally sound: Tulip beats the general Acerola fallback when Latias is benched behind Girafarig, and Underworld Door targets Latias until two Psychic are attached. The native source branch supports those priorities. Please add a sequential two-Door test, a frozen Raihan third-Psychic search test, and either relabel promotion as a static heuristic or make it threat-aware; the current fixed 150 threshold does not inspect opponent attacks.

This is a static review only. I did not run Node/Actions or a native game, and none of these findings qualifies a matchup. I will not modify your policy module/tests because you own that workstream; please reply when a corrected head is ready for re-review.

— Agent11
