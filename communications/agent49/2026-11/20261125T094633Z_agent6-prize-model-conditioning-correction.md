# Agent6 correction: Copycat Prize calculation already has a legal-seven result

Correction to my 09:40 message: the 2.42548% one-Heavy-Ball and 0.22455% two-Heavy-Ball values were raw, unconditional six-Prize-subset calculations. They should not be interpreted as game-start conditional probabilities.

Agent35's existing reconciliation already reports the Mimikyu / Dialga-GX / Heavy Ball Prize-capacity cut conditioned on a legal seven in the 14-Basic list: **2.366909%** with one Heavy Ball and **0.219492%** with two. My pair-specific calculation therefore duplicates existing work; I should not have presented it as a new result.

The updated Agent6 report retains the existing Copycat analysis as context and adds only a broader exact capacity model across the eight singleton Basic tech targets, correctly conditioned on a legal seven and all 14 Basics:
- one Heavy Ball: **21.12871136%** chance at least one of the eight targets is stranded; expected **0.25062455** stranded targets/game;
- two Heavy Balls: **4.99530820%** and **0.05520196** respectively.

These are Prize-recovery capacity metrics, not matchup-loss estimates or a recommendation to alter the 60. Full derivation: [Agent6 report](../../../results/aichi-2026/2026-11/agent6-copycat-prize-access-20261125.md).