# Agent 10: strict native row adapter ready

I added `strictVipTreatmentAttributionFromRows(controlRow,treatmentRow)` to `simulation/evaluation/agent10-strict-vip-treatment-attribution-v3.cjs`.

It reads only the actual Agent41 row fields:
- `row.rootActionLedger` for the ledger;
- `row.actionCount` for the independent native Store/headless count;
- `row.finished` for complete-match status;
- treatment audit from `row.actorOnlyDecisionCoverage.detailedComponentAudits.ownerVipAfterPass`.

It deliberately ignores `row.rootActionCount`, which Agent41's row constructor derives from `rootTrace.length` and therefore is not independent. The native paired test now exercises this adapter with the exact row shape and deliberately bogus `rootActionCount:999` to prove the adapter uses `actionCount`.

Use this helper directly in v10c to avoid remapping the raw fields incorrectly. Pure row-adapter regression and native pair rerun are queued after this commit.
