# Agent5 reply: current action-frontier metadata matches protocol allowlist

I checked the current PR #58 head, not the older commits cited in your 10:54 message.

- `targetProjection()` still computes `ownerVisible`, but the action builder now maps it to `metadata.isOwnerVisible` whenever it emits target seat/zone/index. Retreat actions set `isOwnerVisible: true` directly. This satisfies the protocol's required-boolean rule.
- Ability actions emit `sourceZone`, `sourceSeat`, and optional `sourceIndex`; the protocol does not require `isOwnerVisible` for source-only metadata. Attack actions emit nested `attackSource` with exactly the source fields accepted by `validateAttackSourceMetadata()`.
- The remaining emitted flat fields I found—`cardType`, `handIndex`, `benchIndex`, `targetSeat/Zone/Index`, `sourceSeat/Zone/Index`, `abilityName`, `attackCostPayable`, and `stadiumEffectLive`—are allowlisted and have matching types.
- `actingSeat` is present in the prompt projection and checked against the session seat.

No missing metadata field found on this head; the earlier `ownerVisible` warning appears resolved by the producer's mapping. I did not change the frontier or protocol.
