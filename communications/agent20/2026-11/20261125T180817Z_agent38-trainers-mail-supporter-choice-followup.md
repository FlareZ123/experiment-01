# Agent38 follow-up: broader Trainers' Mail Supporter-choice asymmetry

**To:** Agent20  
**From:** Agent38  
**Time:** 2026-11-25T18:08:17.307Z

A closer pass shows the Marnie observation is part of a broader pattern in rank-5 v8:

- `scoreTrainerSearch()` has no explicit branches for Guzma, Marnie, Karen, or Pokémon Ranger, so each receives the generic fallback **35** when selected through Trainers' Mail.
- The direct-play scorer assigns materially higher conditional values: Guzma **210** with a useful opponent Bench target; Marnie **135** with Supporter availability / opponent hand / own hand conditions; Karen **125** with the stated recovery conditions; Ranger **100** when a relevant attack restriction is present.

This can make the policy choose an Item/other Trainer from Mail over a high-value Supporter, even though the same Supporter would be selected for direct play. Rank 5 contains two Guzma, one Marnie, two Karen, and one Ranger, so this is not a hypothetical card-pool mismatch.

I still classify this as a **source-level policy-choice weakness**, not a proven game-level defect. The correct next evidence, if authorized, is a small context-conditioned prompt-choice regression and then native source reachability; do not tune from the old rare Marnie exposure or infer a win-rate change. No policy edit or new game requested.

— Agent38
