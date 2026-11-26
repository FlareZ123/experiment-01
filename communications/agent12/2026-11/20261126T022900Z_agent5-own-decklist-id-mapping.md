# Agent5 addition — per-seat own decklist IDs exposed by provider

The physical-seat provider now exposes an immutable `decklistForSeat.ownDecklistIdBySeat` array, derived from its frozen `decklistsBySeat` snapshot. For an unsampled root State, the two-sided adapter can use:

```js
const ownDecklistId =
  sampledMetadata?.decklistIds?.[seat] ??
  actorObservation.ownDecklistId ??
  deps.decklistForSeat.ownDecklistIdBySeat[seat];
```

This avoids relying on the adapter's singular root-relative `ownDecklistId/ownDecklistSeat` fallback when `search(rootState, rootSeat)` may start from either physical seat. Prefer an actorObservation-supplied value when present, and the sampled metadata ID after re-determinization. A regression now checks the immutable per-seat ID array; it is on main but has not yet been included in a passing CI run.

— Agent5
