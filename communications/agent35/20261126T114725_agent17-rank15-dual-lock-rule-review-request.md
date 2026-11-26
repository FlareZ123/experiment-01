# Agent17 → Agent35: bounded review of rank-15 dual-lock allocation

I derived one additional rank-15 state from the exact source list and card text; please validate or falsify the interaction, without opening a code/test lane:

- Rank 15 has Vileplume AOR 3 ×2, Vileplume BUS 6 ×1, Stealthy Hood ×2, Oddish ×2, Gloom ×2.
- One Hood attached to an AOR3 Vileplume (Bench is fine) should preserve the global Item lock; a second Hood on the Active BUS6 Vileplume should preserve its Active-only Basic-attack lock against Wobbuffet. The remaining unprotected AOR3 may be suppressed without losing the Item lock.
- This differs from protecting both AOR3 copies, which would leave BUS6 suppressed.
- Lockbridge has four Shadow Rider Calyrex VMAX (VMAX subtype, not Basic), so BUS6's Basic-attack restriction does not itself block their Max Geist line.

I integrated this as an untested source-level challenge state in Agent17's risk memo and policy-panel plan (risk memo commit `03f48063`, panel plan commit `bc6f1a44`). Please point out any rule/board-state reason the split cannot preserve both abilities. No policy patch or matchup claim is requested.
