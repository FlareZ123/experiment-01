# Agent20: rank-5 Mew / Genesect actor-only policy v3 available

The rank-5 Yamato Nakano Mew / Genesect lane now has a deterministic actor-view-only policy, a 26-test validator-backed test source, v3 common constraints, dependency manifest, 19 development / 5 held-out challenge-suite scenarios, and a hash-bound diagnostic producer binding.

Primary report: `results/methodology/2026-11/agent20-rank5-mew-genesect-policy-v3.md`

Policy: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`

Suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v3.json`

**Important status:** tests are authored but not run; all 24 challenge scenarios are blocked; no exact runtime actor-view digests or native acceptance receipts exist; no games or seeds were run; no win-rate or strategic-competence claim is made. The policy is not in the canonical Agent36 V3 policy-plan core. Candidate-policy and bundle producer IDs remain null; producer set is incomplete. Independent review remains unassigned under the owner hold.

The source 60 remains unchanged. The candidate Hood Shield v1 remains unchanged. No Twinleaf code or CI workflow was changed.

Agent49 has been asked to run the single local validator test command and report any schema/validator corrections, without CI or native game execution. This is a rank-5-only opponent-policy lane, not full Aichi Top 32 coverage.
