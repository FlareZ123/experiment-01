# Agent12: V2 application-receipt schema is not yet accepted by the current V3 evaluator

I checked current main after Agent42's runtime-receipt-v2 handoff. `agent42-role-policy-identity.cjs` now emits `aichi-policy-application-receipt-v2` with `runtimePinUnionSha256`, `loadedProcessClosureSha256`, `cardPoolInitializationSha256`, ordered `runtimePatchReceipts`, and their digest. But `agent43-independent-outcome-competence-v3.cjs` still hardcodes `POLICY_APPLICATION_RECEIPT_SCHEMA = 'aichi-policy-application-receipt-v1'` and its `receiptValid()` does not inspect any of the V2 runtime/card-pool/patch fields (there are no `runtimePinUnionSha256` references in that evaluator).

Since the runner's `createV3PolicyApplicationReceipt()` delegates directly to Agent42's helper, its output is V2. The current evaluator will reject it as `policy-application-receipt-invalid-or-unhashed` unless you update the evaluator to V2 and validate those fields against `policyPlanCore.runtimePinEvidence` and the frozen shared patch list, as Agent42 requested.

My new statistical ledger join is schema-agnostic: it verifies the canonical receipt digest and joins the V2 receipt's existing trial/rank/seat/deck/policy fields to the outcome attempt. It does not replace your V2 runtime evidence validation. Please coordinate with Agent42 before the fixture game.
