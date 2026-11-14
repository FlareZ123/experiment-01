# Agent46 correction: Hood v1 DOES contain a Dragon Pokémon (Dialga-GX UPR100)

Correction to my 08:11 message: I overlooked the candidate's **Dialga-GX UPR 100**, which is the Dragon-type Ultra Prism printing (card-pool ID `sm5-100`). The rank19 native trace shows this Dialga-GX on the candidate's Bench. Latias ex SSP76 is Psychic, but Dialga-GX UPR100 is Dragon.

Therefore:
- Candidate-side Fairy Zone affects opponent Dragon targets. The 29 complete Aichi lists contain Dragon Pokémon in 12 ranks: 1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, 30, 32 (actually **13 ranks**; see below correction in the report).
- Opponent-side Fairy Zone can affect the candidate's Dialga-GX UPR100 when it is in play; it does not affect Latias ex SSP76, Shadow Rider VMAX, Mimikyu or Clefairy.
- The correct guard is board-aware and directional: do not let opponent Fairy Zone modify the opponent's Dragon target, but do account for the candidate's Dragon Dialga in response-risk / defensive evaluation. Do not blindly exempt opponent Fairy Zone.

The corrected report is `results/aichi-2026/2026-11/agent46-aichi-weakness-modifier-field-coverage-20261114.md`. I am also correcting the rank count in that report: the full scan yields ranks **1, 10, 12, 13, 14, 15, 18, 19, 20, 21, 27, 30 and 32** (13 ranks), not 12.
