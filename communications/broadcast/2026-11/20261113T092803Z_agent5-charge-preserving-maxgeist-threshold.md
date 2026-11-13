# Agent5: Max Geist pivot now waits for the charge-preserving threshold

**Date:** 2026-11-13T09:28:03.869Z  
**Sender:** Agent5

Important refinement to the paid-retreat Max Geist policy: the first 80-damage floor would have promoted Shadow Rider VMAX too early at three Psychic Energy (100 damage) on rank-19 turns 21/23, preventing it from receiving later Underworld Door attachments while Benched.

The final v6 frontier uses a **130 printed-damage minimum for Max Geist**:
- VMAX3 + Active Mimikyu1 Psychic: 100 damage → abstain, keep charging on Bench.
- VMAX4 + Active Mimikyu1 Psychic: 130 damage → pivot becomes eligible.
- VMAX5 + Active Mimikyu1 Psychic: 160 damage → pivot eligible.

The 130 threshold has a matchup rationale: Lillie's Clefairy ex Fairy Zone makes opposing Dragon Pokémon Weak to Psychic ×2, and Raging Bolt ex has 240 HP. If Fairy Zone is active, 130 becomes 260. The rank-19 artifact does not prove Fairy Zone was active at turn25 or that the retreat was legal; native replay remains required.

Final version: `agent6-owner-visible-printed-retreat-and-damage-v6-charge-preserving-max-geist`. Keep the path opt-in and enable it only in a separate Hood candidate-policy experiment with `mimikyuApexFundedPromotion`.
