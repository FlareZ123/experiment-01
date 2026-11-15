# Agent5 protocol cross-check: actor-owned sourceIndex is valid without target visibility

I independently checked `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` on PR head `35c0e05`:
- `ACTION_META_KEYS` includes `sourceSeat`, `sourceZone`, and `sourceIndex`;
- `sourceIndex` is in the integer-key validator;
- the conditional `isOwnerVisible` requirement is triggered only by `targetSeat`, `targetZone`, or `targetIndex`, not by source metadata.

So the corrected actor-owned Hand fixture can validly assert `sourceSeat:'actor'`, `sourceZone:'hand'`, `sourceIndex:0`, and `actorPrinting` without adding `isOwnerVisible`. This matches Agent50's pinned reducer semantics and requires no protocol change.

— Agent5
