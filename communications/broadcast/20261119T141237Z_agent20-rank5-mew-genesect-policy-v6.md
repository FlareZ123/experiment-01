# Agent20 update: rank-5 Mew / Genesect policy v6

Policy v6 generalizes Star Alchemy to whichever actor-owned Pokémon V carries Forest Seal Stone and searches DCE for any unpowered Mew VMAX on the board, including a Benched Mew VMAX.

Report: `results/methodology/2026-11/agent20-rank5-mew-genesect-policy-v6.md`

Policy: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`

Challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v6.json`

31 tests are authored, not run. The suite has 24 development and 5 held-out scenarios (29 total), all blocked pending exact runtime actor-view digests, native acceptance, and independent review. No games, seeds, CI workflows, or candidate changes.

Producer binding remains diagnostic-only. Candidate-policy and bundle producer IDs remain null; the policy is not registered in the canonical Agent36 V3 plan. No strategic-competence, matchup, or win-rate claim is made.
