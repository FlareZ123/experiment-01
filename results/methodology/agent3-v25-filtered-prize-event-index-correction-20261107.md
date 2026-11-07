# Agent 3: v25 physical Prize *event index* is not a native accepted-root ordinal

**7 November 2026 | Source-code correction, independent of gameplay and win-rate claims.** The historical [v25 exhaustive three-view Prize audit](agent3-v25-exhaustive-independent-three-view-prize-join-20261106.md) correctly identified eight physically exited Prize events and reconciled them to unique check-state KO/draw ancestry and seven optional native Prize-selection prompts under the historical eight-trial developmental treatment. One identifier in the v25 JSON/test/report was imprecisely named.

## Exact reproducible discrepancy

In the immutable native v25 test `tests/agent3-issue25-v25-exhaustive-ko-source-prize-join.native.test.cjs`, the array `perTrialPhysicalExits` is generated directly from `physicalExitAudit.records`, **a filtered array containing only physical Prize exits**. The v25 join searches it with:

```js
const matchingExits=perTrialPhysicalExits.map((row,index)=>({row,index}))
  .filter(({row})=>/* trial, taking seat, turn, card count, destination */);
const exitOrdinal=matchingExits[0].index;
```

The serialized name `exactPhysicalRootOrdinal:exitOrdinal` therefore stores the **zero-based Prize-exit event-array index** `0..7` for the eight events. It is **not** the ordinal `actionOrdinal` in that trial's complete native headless `rootActionLedger`. The underlying `agent3-authoritative-root-prize-exit-observer.cjs` v1 records the Store session, phase, turn, destination, action constructor, before/after Prize sizes and physical card count, but originally did not record the accepted action ordinal.

This naming error could lead a downstream analyst to incorrectly join event index `0` to the native game's accepted action `0` rather than its actual Prize transfer root later in the game. Such a direct numerical join is **invalid**. Existing v25 joins use trial, seat, turn, count and independent token ancestry; they do not use `exactPhysicalRootOrdinal` to compare against the native accepted-root ledger. Thus **the eight-v25 match count and 14 physical-card custody evidence remain as recorded**, but the displayed `Physical root ordinal` label in the report must be interpreted as a **filtered physical-exit record index**.

## Prospective repair boundary

An opt-in, default-off addition to `simulation/twinleaf/agent3-authoritative-root-prize-exit-observer.cjs` now allows the headless `onRootActionDispatched(store,action,actionOrdinal,seat,turnBefore)` callback to bind an accepted native root ordinal **after its actual successful Store dispatch**. It checks the registered Store object and identity of the exact action object. Any foreign Store, duplicate callback or different action fails closed, and the binding is removed in `finally`. Pure regression tests cover the positive case and three invalid callbacks. The original v25 observer default behavior is unchanged.

The separate new `tests/agent3-issue25-v26-true-accepted-root-ordinal.native.test.cjs` requires **every** physical Prize exit to have a callback-bound actual action ordinal that maps to exactly one matching root in the original trial's native public root ledger, with exact action name, actual actor seat, and before/after global turn. It relabels the filtered identifier `physicalExitEventIndex`, stores `trueAcceptedRootActionOrdinal` separately, and preserves frozen source/candidate 60s, trials, policy, seeds and statuses. Until its separately identifiable native CI archive is published, **no new actual-root claim is established**.

This is a measurement-provenance repair. It introduces no new decklist, independently qualified paper game, or competitive win-rate evidence. Original source status remains 29 of 32 authenticated card-name/count lists, zero competitively qualified games and no demonstrated 99.5% win rate.
