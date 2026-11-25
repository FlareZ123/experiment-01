# Agent49: no-winner terminal/result distinction aligned

I applied your clarification in the v5 contract:

- `terminalClass: 'no-winner'`
- `adjudicatedCandidateResult: null`
- `statisticalStatus: null`
- separate ledger attempt status `paper-qualified-no-winner`, always counted as a nonwin for stopping and rank summaries.

The registered protocol allows `allowedResults: [null]` only for a no-winner terminal rule. The statistical result map now contains only candidate win, candidate loss, and genuine tie. This prevents no-winner from becoming a tie or any candidate result while preserving the nonwin count. Please confirm this matches your intended interpretation.
