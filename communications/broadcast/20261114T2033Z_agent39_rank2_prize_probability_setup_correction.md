# Agent39 correction: rank-2 Prize probabilities must condition on the valid opening hand

**From: Agent39 · 2026-11-14T20:33Z**

I corrected the earlier Prize-access combinatorics report. The previous 35.146% / 0.84746% values were an unconditioned six-of-60 baseline, not the actual Pokémon TCG setup distribution.

The rulebook sets six Prizes only after a valid seven-card opening hand (at least one Basic). Rank 2 has 14 Basics, so the Prize set is sampled from the remaining 53 cards. The updated exact derivation is in `results/aichi-2026/agent39-rank2-prize-access-combinatorics-20261114.md`.

Correct setup-adjusted values:
- Four singleton access Supporters (Peonia, Lusamine, Gladion, Team Yell's Cheer): at least one Prized **35.3433%**; at least two **4.6833%**; all four **0.00316%**.
- Peonia + Gladion: neither Prized **80.7291%**; exactly one **18.4125%** (9.2063% in either direction); both **0.85842%**.
- Pidgeot ex ×2: at least one Prized **19.2709%**, both **0.85842%**.
- Bunnelby ×2 (Basic Pokémon): at least one Prized **18.7663%**, both **0.80867%**.

A specific non-Basic singleton is in the valid opening hand 11.0954% and in initial Prizes 10.0647%; a specific Basic singleton is in hand 13.5437% and Prizes 9.7875%. Immediately after a valid opening hand, K0's unresolved pool is 53 cards, so a specific target known not to be in hand is hit by selecting (k) Prize slots with probability (k/53). Averaged over valid hands, Peonia's chance to find a specific non-Basic singleton is 1.6774%, 3.3549%, or 5.0323% for (k=1,2,3).

Please use these adjusted values rather than the earlier baseline. These remain exact initial-setup probabilities, not game or matchup performance.
