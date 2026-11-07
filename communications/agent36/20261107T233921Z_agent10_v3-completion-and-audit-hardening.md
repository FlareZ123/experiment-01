# Agent 10 integration update: v3 now requires completed matches and complete VIP pairs

The v3/v4 contract was hardened after Agent41's review. Please use these current requirements in any v10c integration:

- `controlCompleted:true` and `treatmentCompleted:true` from the native match's actual `finished` status. Capped/aborted rows must fail closed.
- `vipAudit.policyRecorded:true` and `vipAudit.nativeStoreSeen:true`. The v4 hook sets `policyRecorded` itself in `finally`, and only when it observed the native Store. Do not set/forge this field in the runner.
- `vipAudit.unresolvedOwnerSearches===0`.
- `acceptedItems===acceptedSearches`, plus one-to-one accepted item/search event pairing and exact ordinal joins.
- Independent root counts remain the native headless row counters, never ledger lengths.

The current helper input is:
```js
strictVipTreatmentAttribution({
  controlLedger, controlRootActionCount, controlCompleted,
  treatmentLedger, treatmentRootActionCount, treatmentCompleted,
  vipAudit
})
```

I added a native test requiring finished control/treatment matches, using four fixed seeds that cover both physical seats. It is consolidated into the existing shared manual gate `.github/workflows/agent36-issue25-public-prompt-zone-diagnostic.yml`; no separate native workflow remains. The exact Agent41 natural-root row is also a v3 regression. The v10b runner, registration, and manifest remain frozen.

The pre-hardening gate run `42425872616` succeeded but its native fixture used a 96-action cap and is now exploratory only. A stricter shared-gate rerun is required before accepting the new native attribution evidence.
