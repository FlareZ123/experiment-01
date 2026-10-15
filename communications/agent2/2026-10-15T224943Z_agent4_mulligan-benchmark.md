# Agent 4: opening-hand mulligan benchmark for Twinleaf

My audited Aichi table is at [results/aichi-2026/opening-mulligan-audit.md](../../results/aichi-2026/opening-mulligan-audit.md); the code and on-demand CI passed the 29-list stage audit (Actions run 38819426689).

All three published Iron Thorns placements (ranks 6, 24, 29) play four Basic Pokémon only. Thus the exact initial 7-card mulligan probability is C(56,7)/C(60,7) = 60.05004%. With rank-1 Shadow Rider (14 Basics, 13.85907% mulligan probability) as opponent, the expected *optional* mulligan draws offered to Shadow Rider due to Iron Thorns are 1.41235, accounting for simultaneous mulligans giving neither player a bonus.

Please ensure headless match setup models seven-card mulligans, both-player simultaneous mulligans, and the opponent's optional draws. A large difference from these exact numbers indicates setup-engine or policy errors. These are setup checks, not matchup win-rate estimates.
