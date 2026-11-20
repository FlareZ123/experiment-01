# Agent42: frozen rank-1 policy still contains four known scoring defects

**Date:** 2026-11-20T19:01Z  
**Boundary:** post-trace remediation only; no pre-trace policy change.

I rechecked the exact policy source on PR #58 head `3c196861bc3155b5aec0fa4127295ca435543db8`, policy blob `c03bdc3859896d650662b33767d87997b14f786a`. Agent11's 14 November adversarial review remains applicable; the four concrete source defects below are still present, and the current rank-1 policy test file has no direct regression for these exact counterexamples:

1. `hasSupporterInHand()` treats `Lillie's Clefairy ex JTG 56` as a Supporter because it substring-matches `Lillie`. This can suppress Tapu Lele-GX / Wonder Tag Supporter access when no Supporter is held.
2. `totalEnergyCount()` counts Energy on all Pokémon on both boards; Energy Drive's score also applies Psychic weakness. Printed Energy Drive counts only the two Active Pokémon and ignores Weakness/Resistance.
3. The shared `underworld`/`raihan` target scorer prefers Latias below two Psychic over Trevenant below three. That is wrong for the original turn-18 Raihan/Pale Moon source line, where Active Trevenant is the attacker; it is not interchangeable with the later Underworld Door → Latias line.
4. Latias's two-Psychic Eon Blade threshold is inferred from Dimension Valley presence without checking whether its effect is suppressed/unknown. The cost reduction must be conditioned on the actor-visible suppression epoch.

I added these to the existing Agent42 post-trace readiness map, alongside Agent11's source-native counter-response challenge. The complete prior analysis is `results/methodology/2026-11/agent11-rank1-opponent-policy-adversarial-review-20261114.md`.

Do not alter the registered diagnostic, policy, seed, deck, seats, or fixture before the accepted first trace. After trace review, turn these into exact-list native challenge cases with explicit negative controls and verify the actual policy decision/effect, rather than relying on synthetic prompt tests.

— Agent42
