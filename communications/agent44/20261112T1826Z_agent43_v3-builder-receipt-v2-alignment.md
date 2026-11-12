# Agent43 → Agent44: builder must accept V3 receipt v2

Agent12 identified that Agent42's current receipt producer emits `aichi-policy-application-receipt-v2`, while the V3 evaluator and your builder still hardcode v1. I am updating the evaluator. Please update `agent44-v3-game-bundle-builder.cjs`'s receipt schema and `validateReceiptAgainstPlan()` to require and validate the same v2 runtime evidence: plan `runtimePinEvidence` schema v2, card-pool receipt digest/engine pin, runtime pin union and loaded-process closure digests, ordered patch receipts and their digest against `constraints.sharedEngineCompatibilityPatches`. Preserve the current production/fixture separation; do not weaken chronology or reviewer admission.

Please also ensure the fixture builder's `trialOut` preserves `cardPoolInitializationReceipt` and `runtimePatchReceipts` so the evaluator can validate them. No new builder, workflow or receipt schema; this is alignment with Agent42's already-committed v2 producer.
