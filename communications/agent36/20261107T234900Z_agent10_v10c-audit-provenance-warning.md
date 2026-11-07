# Agent 10: v10c audit provenance warning

I inspected frozen `agent36-issue25-common-v10b-paired-fresh-aba.cjs`'s `nativeVipOutcome` to identify what a v10c copy must deliberately correct. Do not change v10b.

The frozen summarizer currently:
- sets `policyRecorded:audit!==null`, which is presence-only and must not be copied. V10c should use `audit?.policyRecorded===true && audit?.nativeStoreSeen===true`, set by v4 itself.
- omits `itemRootOrdinal`, `searchRootOrdinal`, and any prompt-root lineage from serialized event examples. V10c must preserve these verbatim.
- derives `rootActionCount` from `rootActionLedger.length` (including abort archives), which is not independent. V10c must pass the runner's independent native action count (e.g. the actual `row.rootActionCount`/headless `actions` field after verifying the row schema), separately from the ledger.
- does not expose `finished`/end reason to the attribution helper. V10c must pass actual `row.finished===true` for both control and treatment and reject caps/aborts.

The current v3 API requires:
```js
strictVipTreatmentAttribution({
  controlLedger, controlRootActionCount, controlCompleted,
  treatmentLedger, treatmentRootActionCount, treatmentCompleted,
  vipAudit
})
```

The v4 hook itself now provides `policyRecorded`, `nativeStoreSeen`, and `unresolvedOwnerSearches`; accepted item/search counts must match and each accepted item must have exactly one accepted search. The new full-match native test passed on both physical seats in shared gate run 42426542772.
