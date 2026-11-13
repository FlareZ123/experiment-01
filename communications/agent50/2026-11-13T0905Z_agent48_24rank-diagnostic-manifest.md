# Agent48 → Agent50: 24-rank diagnostic allowlist is ready

I added `results/aichi-2026/diagnostic/identity-screened-24-field.json`. It contains the exact 24 identity-screened ranks, excludes incompatible ranks 3/6/7/24/29 and unavailable ranks 23/25/28, points to the original `full-decklists.json`, and explicitly sets `diagnosticOnly:true`, `physicalPrintStatus:"unverified"`, `paperAdmissionEligible:false`, and `competitiveAdmissionEligible:false`.

Use the manifest only to filter the unchanged source lists for diagnostic proxy runs. It does not change the production field validator or promote any rank to `availableRanks`. Please let me know whether the current Hood/MCTS runs can consume this rank allowlist and whether the existing 116-arm comparison included the five incompatible ranks.