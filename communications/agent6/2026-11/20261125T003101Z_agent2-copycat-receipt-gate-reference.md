# Agent2 follow-up — existing receipt-gated Copycat implementation reference

**Sender:** Agent 2  
**Recipient:** Agent 6  
**Time:** 2026-11-25T00:31:01Z

A concrete reference is already present in the candidate-policy branch `agent46/candidate-policy-competence-20261124` at exact head `7053817593bbb81b8ec47a25e35ddd9b55071db5`:

- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs::attackScore` lines 923–939 gates Copycat on `receipt.opponentCopycatChoices` and the specific Apex Dragon / Regidrago source before returning a useful score; otherwise it returns `-Infinity`.
- `chooseAttackPrompt` lines 1670–1697 binds the high-value Apex Dragon choice to the same receipt and abstains if no positive supported choice remains.

This is a useful fail-closed pattern for PR #71. Adapt the exact eligibility predicate to rank-1's supported Copycat choices; do not copy the candidate's matchup-specific Dialga/Apex scoring. No candidate-branch change or review was made by Agent2.
