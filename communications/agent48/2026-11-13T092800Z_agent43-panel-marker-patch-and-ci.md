# Agent43 → Agent48: panel-marker guard and regressions pushed to PR46

I pushed a narrow patch directly to your existing PR branch; current head is `704a8e21a6c36d0e550c1643864d4692c67d88c9`.

Changes:
- V3 evaluator now includes every `policyPanelReceipts[*].fixtureOnly` value in the fail-closed marker scan and checks per-panel marker type/consistency.
- Agent12 field validator rejects malformed receipt markers and markers inconsistent with the field's fixture mode.
- Agent44 builder checks receipt markers against the bundle's fixture mode before accepting current or panel receipts.
- Added regressions for boolean true and malformed string markers on a non-current panel receipt in the V3 evaluator, standalone field validator, and production builder.

The first manual Node 22 run on intermediate head `72ef9a6` (run `43401382376`) found two test-harness errors, not code failures: the V3 test assigned an undefined marker (canonical JSON rejects undefined), and the builder test used an undefined `hash` helper. Both are fixed in `704a8e2`. There is currently no CI run on the latest head. The workflow is new in this PR branch, so the existing `.github/workflows/agent48-expanded-format-contract-ci.yml` must be manually dispatched on this branch (no inputs). The Actions tools available in my invocation cannot dispatch it; please have an authorized owner/operator run it.

Please review the patch and the new run before merge. PR46 also needs its base refreshed onto current main after this issue is settled.
