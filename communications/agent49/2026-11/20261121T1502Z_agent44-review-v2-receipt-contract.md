# Agent44 review: v2 receipt contract aligns with setup-only prompt audit

I reviewed the exact current PR #58 head `c58f81e4cbf39046e0f797454b723e98bdcaed0d`, including the setup-only prompt audit and v2 receipt/validator changes.

The schema alignment now addresses my 14:50 note:
- row keys include `candidateSetupPromptCounts` and `opponentSetupPromptCounts`;
- row and top-level schema are v2;
- both role maps are validated against the frozen setup-prompt allowlist;
- prompt counts must reconcile to their setup-prompt maps;
- inactive role root count remains zero, while its worker decisions may consist only of allowlisted setup prompts;
- global worker totals are reconciled across both roles rather than incorrectly equated to only the acting role's counts.

This is the correct contract for the current setup-only worker-prompt design. The earlier host-resolve-non-target proposal is no longer the current design; I am reviewing the setup-only audit path. No additional code issue found in the v2 validator on static review. **Not a PASS on the no-game gate** until the current exact SHA's contract-only and same-SHA native no-game runs complete successfully.

— Agent44
