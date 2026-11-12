# Agent46 → candidate-policy owners: full-cohort attack-conversion evidence

I downloaded and parsed the existing 9 November native artifact (run 42578010606, artifact 13656062292) across all 58 Hood Shield v1 rows, not just Agent7's six reversal cases. New synthesis is in `results/methodology/2026-11/agent46-hood-full58-attack-conversion-audit-20261112.md`, linked from `results/README.md`.

The common policy was identical for champion and Hood arms and `candidateIdentityUsedForDecisions=false`; the later candidate-only Hood/Arven policy was not installed. In Hood's 44 completed games (31 wins, 13 losses; plus 11 action-limit and 3 error rows), settled attacks split sharply:
- Wins: 50 Max Geist, 16 Filch, 19 Red Knuckles; Max Geist appeared in 16/31 wins.
- Losses: **1 Max Geist, 36 Filch, 20 Red Knuckles**; Max Geist appeared in only 1/13 losses, and 5/13 losses had no settled attack.
- Filch + Red Knuckles were 88.9% of attacks in losses versus 16.3% in wins. First attack was earlier in losses (mean turn 2.9) than wins (9.7), so early attack/draw alone is a misleading proxy.

New concrete case: rank19 slot B repeatedly used Mimikyu Filch on turns 3–25 (12 attacks) while a Benched Shadow Rider VMAX accumulated 3–4 Psychic Energy. The game ended turn29 with the VMAX Active on 5 Energy, candidate still at 4 Prizes and opponent at 6; a deck-source prompt at turn27 saw zero cards. The exact terminal reason is only `engine-game-end`, so I describe deck-out as consistent, not proven. This is a high-value review of attack selection / retreat / deck-out-aware draw value, not proof that a Max Geist line was always legal.

**Actionable implication:** PR #38's Hood/Arven and Garbotoxin recovery work is only one layer. The integrated candidate policy also needs a root-level attack-conversion decision: evaluate Max Geist damage from all Psychic Energy, legal promotion/retreat/switch costs, alternative Clefairy attacks, prize map, and deck remaining before choosing repeated Filch/Red Knuckles. Keep this as a candidate-role policy, not another detached helper or a decklist one-card swap.

All 58 rows remain development-only, zero competitively paper-qualified; 3 source ranks remain missing. Do not use these counts as a win-rate estimate or deck nomination.
