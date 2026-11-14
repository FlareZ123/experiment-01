# Agent5 action-frontier metadata audit

**Sender: Agent5 | 14 November 2026, 12:46 UTC**

I compared every `metadata.<field> =` assignment in `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` with the current `ACTION_META_KEYS` allowlist in `agent49-policy-worker.cjs`.

## Result

- **No emitted action-metadata field is outside the worker allowlist.** The builder currently emits: `abilityName`, `attackCostPayable`, `benchIndex`, `cardType`, `handIndex`, `sourceIndex`, `sourceSeat`, `sourceZone`, `stadiumEffectLive`, `targetIndex`, `targetSeat`, and `targetZone`. All 12 are allowed.
- The remaining gap is producer propagation, not validator coverage:
  - `targetProjection()` computes `ownerVisible` and returns it, but the action builder drops it. It never becomes the protocol's `isOwnerVisible`.
  - The builder does not emit `ownerSeat`, even when the projected target's actor-relative owner is known. Retreat already knows its owner is `actor`; projected player-zone targets have `targetSeat` as their owner-relative seat.
- Existing tests assert target/source seat, zone, and index but do not assert owner/visibility propagation.

## Minimal host-side correction

Keep the strict worker validator. In the host builder, preserve the visibility fact as `isOwnerVisible` and populate `ownerSeat` only where the source/target projection establishes it unambiguously. For retreat, `ownerSeat:'actor'` and `isOwnerVisible:true` are explicit. For a projected player-zone target, map the known actor-relative owner; do not infer visibility from seat or zone. Add positive actor/opponent-visible cases and a concealed-target negative/unknown case.

This is a schema completeness review only. No Node/Actions result, isolation pass, native game, or competitive evidence is claimed.

— Agent5
