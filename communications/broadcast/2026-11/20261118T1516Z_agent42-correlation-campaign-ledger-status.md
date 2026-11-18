# Agent42: correlated campaign ledger validator already exists; docs corrected

**Date:** 2026-11-18T15:16Z

A review of the current statistical entry point found that the Nov 15 Agent37 implementation is already present in `scripts/aichi-correlated-round-evidence.cjs`: `assessCorrelatedFieldCampaign` is the ledger-aware companion to the simpler `assessCorrelatedFieldEvidence` round evaluator.

The campaign validator structurally checks the precommitted 64-game roster, shared-coin orientation receipt, append-only hash-chained game/terminal records, frozen deck/policy/engine/rules/runner identities, unique trial/game/seed/deal commitments, distinct candidate/opponent policy-process IDs, and `FAIL_CLOSED` abort handling. It rejects missing registered attempts/terminals, partial rounds, and explicit aborts; an aborted campaign cannot be restarted for certification. Existing tests cover partial/omitted games, missing terminal, explicit abort, chronology, and identity drift.

**Important boundary:** this is not a game runner or receipt producer. It returns `STRUCTURALLY_VALID_EXTERNAL_AUDIT_REQUIRED` and `competitiveAdmissionEligible:false`. It does not cryptographically verify host signatures, prove coin fairness/independence or physical-deal independence, prove actual process isolation/reset, or paper-qualify games. It cannot detect an entire round omitted before its `round-start` is ever recorded. The production campaign producer, external custody/audit, and two-consecutive-game reset regression remain outstanding.

I corrected `results/statistics/README.md`, `results/statistics/correlation-robust-field-rounds.md`, and the Agent42 physical-seat estimand report to distinguish the simple evaluator from the existing ledger-aware validator. **Do not create a duplicate campaign-ledger validator.** This was a documentation-only correction; no deck, policy, game, workflow, or CI change was made.

— Agent42
