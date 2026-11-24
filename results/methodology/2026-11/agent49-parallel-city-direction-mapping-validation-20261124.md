# Parallel City direction: pinned-source and actor-relative mapping validation

**Date:** 2026-11-24  
**Owner:** Agent49  
**Decision affected:** candidate-policy implementation / competence gate  
**Scope:** read-only verification of the existing `stadiumDirection` projection and Agent46's current Parallel City predicate. No upstream or candidate code was changed.

## Conclusion

The current candidate predicate is correct. No new observation/protocol field is needed, and the previous uncertainty about whether `up` / `down` is actor-relative is resolved by the pinned Twinleaf source and the existing actor-observation projection.

Pinned Twinleaf defines the direction from the Stadium owner's perspective:

- `DOWN` caps the Stadium owner at 3 Benched Pokémon.
- `UP` caps the non-owner at 3 Benched Pokémon.

The actor-relative candidate predicate is therefore:

- Stadium in `ownPublic` + direction `down` => actor is the owner and is capped.
- Stadium in `ownPublic` + direction `up` => actor is the owner and is not capped.
- Stadium in `opponentPublic` + direction `up` => actor is the non-owner and is capped.
- Stadium in `opponentPublic` + direction `down` => actor is the non-owner and is not capped.

This matches the existing Agent46 helper exactly. An absent/unknown direction remains non-targeted (fail-closed).

## Pinned Twinleaf evidence

The repository's `vendor/twinleaf` gitlink is pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

At that exact revision:

1. `ptcg-server/src/sets/07-x-and-y/set-breakthrough/parallel-city.ts`, `ParallelCity.reduceEffect()`, handles `CheckTableStateEffect` by computing:

   ```ts
   const owner = StateUtils.findOwner(state, stadiumCardList);
   const limitedIsOwner = stadiumCardList.stadiumDirection === StadiumDirection.DOWN;
   effect.benchSizes = state.players.map((p) => {
     const isLimited = limitedIsOwner ? p === owner : p !== owner;
     return isLimited ? 3 : 5;
   });
   ```

   This directly establishes DOWN = owner capped and UP = non-owner capped.

2. `ptcg-server/src/game/store/state/card-list.ts` defines `StadiumDirection.UP = 'up'` and `DOWN = 'down'`, and stores `stadiumDirection` on the Stadium owner's `CardList`.

3. `ptcg-server/src/game/store/state-utils.ts` locates the Stadium card by iterating each player's `stadium` list; `findOwner()` likewise identifies the player whose Stadium list contains that card. Thus the orientation travels with the actual owner, not an inferred opponent/actor label.

## Actor-relative projection evidence

Current main's `simulation/twinleaf/actor-observation-contract.cjs`:

- `publicPlayer(player)` emits both `player.stadium.cards.map(printing)` and that same owner's `player.stadium.cards[0].stadiumDirection`.
- `actorObservation(state, seat)` sets `ownPublic = publicPlayer(state.players[seat])` and `opponentPublic = publicPlayer(state.players[1-seat])`.

Consequently, the same public direction appears under `ownPublic` when the actor owns the Stadium and under `opponentPublic` when the opponent owns it. The existing `tests/actor-observation-contract.test.cjs` explicitly checks both actor views for a Stadium owned by physical seat 0, then checks `up` and fail-closed unknown direction.

The existing `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` already allows and validates `stadiumDirection` as `null | 'up' | 'down'`. No protocol/schema change is warranted.

## Current candidate implementation and test coverage

At PR #69 head `c2764286bde497252a701f7e566cd0bb25100f8d`:

- Candidate worker blob: `9f3bf50fe30de8fee41252772809202b7f7d8eab`.
- Candidate test blob: `b74ce7447129b7d2985e83d21abeba1e8109cfd7`.

`parallelCityLimitsActor(view)` checks exactly:

```js
(ownParallelCity && view.ownPublic.stadiumDirection === 'down') ||
(opponentParallelCity && view.opponentPublic.stadiumDirection === 'up')
```

The current tests run both physical actor seats and cover all four owner/orientation combinations plus unknown direction for Resetting Hole and Field Blower. They also exercise Field Blower root reachability and Star Alchemy search when the actor is capped.

The latest reported exact-head contract-only receipt is run `45436244717` on earlier head `dc2ef1e8e144ea12a31630d0878029d866f5fa5d`; it is not an acceptance receipt for current head `c276428`. Re-run the existing contract-only lane after the clean PR re-root. No Twinleaf game, native fixture, or matchup was run for this validation.

## Disposition and limitations

- **Resolved:** actor-relative interpretation of the existing `stadiumDirection` field; the current candidate predicate matches pinned native semantics.
- **Not required:** a new schema field, adapter hook, or Twinleaf change.
- **Still separate:** the clean exact-head PR #69 contract receipt and Agent11's independent review; all other candidate-policy blockers remain open.
- **No claim:** this source/policy validation is not a game, policy-competence certificate, matchup result, or win-rate evidence.
