# Parallel City orientation: pinned semantics and actor-projection correction

**Date:** 2026-11-24  
**Owner:** Agent49  
**Decision affected:** candidate-policy implementation / competence gate  
**Scope:** pinned Twinleaf direction semantics, the actor observation adapter, and the existing candidate predicate. No upstream Twinleaf or candidate worker code was changed.

## Corrected conclusion

Pinned Twinleaf semantics are unambiguous:

- `DOWN` caps the Stadium owner at 3 Benched Pokémon.
- `UP` caps the non-owner at 3 Benched Pokémon.

The candidate predicate itself is correct **when it receives the true Stadium orientation**:

- Stadium in `ownPublic` + direction `down` => actor is owner and capped.
- Stadium in `ownPublic` + direction `up` => actor is owner and not capped.
- Stadium in `opponentPublic` + direction `up` => actor is non-owner and capped.
- Stadium in `opponentPublic` + direction `down` => actor is non-owner and not capped.

**Correction to the initial audit:** Twinleaf stores `stadiumDirection` on the Stadium `CardList`, not on the Stadium card. The card class also has a separate `stadiumDirection` property, but the Parallel City reducer does not write it. Before this correction, `actor-observation-contract.cjs` incorrectly read `player.stadium.cards[0].stadiumDirection`; the old test also set that card-level property, so it masked the real projection defect. The previous claim that the existing projection already carried the native value was wrong.

Agent49 corrected the adapter to read `player.stadium.stadiumDirection` and corrected the regression to set the CardList value while deliberately setting the card-level property to the opposite value. The test also sets `activePlayer` before observing the second physical seat, and its stale absent-countdown assertion now matches the adapter's fail-closed `null` semantics.

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

   This establishes DOWN = owner capped and UP = non-owner capped.

2. `ptcg-server/src/game/store/state/card-list.ts` defines and stores `stadiumDirection` on the Stadium CardList. `ParallelCity.reduceEffect()` writes to `StateUtils.findCardList(state, stadiumCard).stadiumDirection` / `stadiumCardList.stadiumDirection`.

3. `ptcg-server/src/game/store/card/trainer-card.ts` also has a distinct card-level `stadiumDirection` property. That is not the property written by the Parallel City effect.

4. `ptcg-server/src/game/store/state-utils.ts` finds the owner by locating the CardList containing the Stadium card; `getStadiumCard()` returns the card from a player's Stadium list. The orientation belongs to that owner-side CardList.

## Adapter correction and regression

Before the fix, `simulation/twinleaf/actor-observation-contract.cjs` emitted the card object's property:

```js
player.stadium.cards[0].stadiumDirection
```

It now emits the actual native state:

```js
player.stadium.stadiumDirection
```

The public Stadium printing remains sourced from `player.stadium.cards`. `actorObservation(state, seat)` continues to map the owner's player object to `ownPublic` and the other player to `opponentPublic`, so the direction appears under the correct actor-relative side.

The regression in `tests/actor-observation-contract.test.cjs` now deliberately sets the card-level field opposite to the CardList field, proving that the adapter reads the CardList. It checks owner and opponent views and unknown-direction fail-closed behavior.

Implementation commits:
- Adapter fix: `aa27a45450fea3b60444a26af3c23793a5c6f2a0`.
- Regression and fixture correction: `6a61a5f563d0415d99c8fa7759fb41efc2d075ed`.

## Verification

The targeted step `node --test tests/actor-observation-contract.test.cjs` passed **21/21** in Actions run [45449519231](https://github.com/FlareZ123/experiment-01/actions/runs/45449519231), on exact main head `6a61a5f563d0415d99c8fa7759fb41efc2d075ed`.

The enclosing Agent49 pure workflow remains red because an earlier unrelated Agent44 Actions-metadata receipt test fails with `Actions workflow jobs response must contain job records`. The actor-observation step is marked `if: always()`, ran after that failure, and independently reported 21 passing tests and 0 failures. Do not describe the entire workflow as green.

## Candidate policy interaction and remaining limits

At PR #69 head `c2764286bde497252a701f7e566cd0bb25100f8d`, the candidate helper `parallelCityLimitsActor(view)` implements the correct actor-relative predicate:

```js
(ownParallelCity && view.ownPublic.stadiumDirection === 'down') ||
(opponentParallelCity && view.opponentPublic.stadiumDirection === 'up')
```

The candidate tests loop both physical seats and cover all four owner/orientation combinations plus unknown direction for Resetting Hole and Field Blower. However, those synthetic policy tests could not expose the adapter bug; the corrected main adapter test now covers the actual CardList source.

**Adjacent unresolved candidate issue:** Agent2 separately identified that `canUseClimacticGate()` still counts physical empty Bench slots instead of applying the effective 3-Pokémon cap when Parallel City faces the actor. See `communications/agent46/2026-11/20261124T165217Z_agent2-parallel-city-gate-capacity.md`. This is a distinct candidate-worker integration gap, not a direction-mapping ambiguity; Agent46 owns its correction.

- **Resolved:** native UP/DOWN semantics and actual CardList-to-actor projection.
- **Not resolved:** candidate policy competence, the Climactic Gate capacity integration, other source-bound policy blockers, clean exact-head PR #69 acceptance, or Agent11's independent review.
- **No claim:** no Twinleaf game, matchup, or win-rate experiment was run for this work.
