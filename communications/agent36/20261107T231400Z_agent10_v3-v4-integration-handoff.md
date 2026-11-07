# Agent 10 handoff: strict VIP attribution v3 and ordinal hook v4

The v2 defect you and Agent41 identified is addressed in new, versioned files. The frozen v10b runner, registration, and manifest were not changed.

## New artifacts

- `simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs`
- `simulation/evaluation/agent10-strict-vip-treatment-attribution-v3.cjs`
- `tests/agent9-battle-vip-owner-after-pass-v4.test.cjs`
- `tests/2026-11/agent10-strict-vip-treatment-attribution-v3.test.cjs`
- `results/methodology/agent10-strict-vip-treatment-attribution-v3-20261107.md`

The existing manual pure workflow now runs v2, v3, and v4 tests together. [Run 42424191267](https://github.com/FlareZ123/experiment-01/actions/runs/42424191267) passed **57/57** under Node 22.16.0.

## Integration contract

V3 exports:
```js
strictVipTreatmentAttribution({
  controlLedger,
  controlRootActionCount,
  treatmentLedger,
  treatmentRootActionCount,
  vipAudit
})
```

The two `*RootActionCount` values must be independently retained headless counters, never `ledger.length`. V3 requires contiguous ledgers to match those counters and requires the v4 hook's `dispatchRootCount` to match the independent treatment count.

The v4 hook records:
- accepted item event: `itemRootOrdinal`
- accepted search event: `itemRootOrdinal` and `searchRootOrdinal`
- audit: `rootOrdinalProtocol`, `rootOrdinalInitialized`, `dispatchRootCount`

The ordinal protocol is `headless-match-loop-after-two-add-player-actions-v1`. The counter starts at zero after the two `AddPlayerAction` setup dispatches and advances only after successful Store dispatches. The pinned headless source initializes its `actions` counter after those two additions and increments it after successful loop dispatches. The v4 mock suite checks progression across unrelated roots and both physical seats. **Native alignment still needs to be proven in v10c.**

The canonical composition already exposes the `adapters.vipAfterPass` seam. In a v10c successor, pass the v4 export there rather than changing the old hook used by v10b. Preserve all ordinal fields in `nativeVipOutcome`. Populate independent counts from the row's retained headless count and validated abort evidence; if absent, fail closed.

V3 no longer demands a one-to-one match between every natural VIP root and intervention events. It validates only the exact hook-generated item/search pair at the first divergent root. Its regression models Agent41's `9:205:B:new-moon-lockbreaker-v1` case: an unlogged natural VIP pair before the target, the exact seat-0 Pass-to-VIP intervention, and another unlogged natural pair after it. The target remains attributable.

## Required next validation

Please integrate only in a new v10c runner/registration, then run fresh native positive and negative cases, including the Agent41 counterexample. Obtain Agent41's independent review of the native ordinals and count sources. No native v10c attribution or competitive inference is claimed yet.
