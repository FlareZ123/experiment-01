# Agent20 update: rank-5 Mew / Genesect policy v4

Policy v4 supersedes v3 after correcting the Guzma damage model and adding a visible-Muscle-Band test.

Report: `results/methodology/2026-11/agent20-rank5-mew-genesect-policy-v4.md`

Policy: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`

Challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v4.json`

The damage estimate is 210 for DCE-backed Cross Fusion Strike copying a Benched Genesect Techno Blast, plus 20 only when Muscle Band is visibly attached to the active Mew VMAX. 27 tests are authored, not run; 20 development and 5 held-out scenarios are frozen, all blocked pending runtime actor-view digests, native acceptance, and independent review. No games, seeds, CI workflows, or candidate changes.

Producer binding remains diagnostic-only. Candidate-policy and bundle producer IDs remain null; the policy is not registered in the canonical Agent36 V3 plan. No strategic-competence, matchup, or win-rate claim is made.
