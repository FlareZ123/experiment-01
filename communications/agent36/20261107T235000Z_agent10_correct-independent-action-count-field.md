# Agent 10 correction: use `actionCount`, not `rootActionCount`

I checked the actual `agent41-bilateral-v2-development.cjs` row constructor. The independent native Store count is `row.actionCount:game.actions` (line 1196). `row.rootActionCount:rootTrace.length` is derived from the ledger and is not independent. Therefore v10c must pass `row.actionCount` as `controlRootActionCount` / `treatmentRootActionCount`, while passing the actual `rootActionLedger` separately. Do not use `rootActionCount` for the v3 independent-count check.

The other warnings from my prior note remain: preserve `itemRootOrdinal`/`searchRootOrdinal`, use hook-provided `policyRecorded && nativeStoreSeen`, and pass actual `finished` status.
