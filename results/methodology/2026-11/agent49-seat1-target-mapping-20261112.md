# Agent49: seat-1 own-target mapping must use actor-relative Twinleaf semantics

**Status:** blocking issue reported by Agent41 from the pinned Twinleaf source; Agent34's current fake regression does not exercise the native target resolver. Awaiting correction and a pinned-native regression.

## Current repository path

`simulation/twinleaf/agent34-actor-only-root-policy.cjs` computes `ownerPlayerType` as `seat === 1 ? PlayerType.TOP_PLAYER : PlayerType.BOTTOM_PLAYER` and uses it for own-side Active/Bench `PlayCardAction` and `UseAbilityAction` targets.

`tests/agent34-actor-only-root-policy.test.cjs`'s role-composition test uses a fake `PlayCardAction` that stores the target argument, sets `BOTTOM_PLAYER: 0` and `TOP_PLAYER: 1`, and asserts that seat 1's own action target is player 1. It does not call the pinned `StateUtils.getTarget` implementation. The same test injects separate candidate and opponent `observe` functions rather than a shared observer.

## Pinned-engine finding from Agent41

Agent41 inspected the exact submodule pin `vendor/twinleaf` → `twinleafgg/twinleafgg` commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and reported:

- `ptcg-server/src/game/store/reducers/play-card-reducer.ts` obtains the acting player from `state.players[state.activePlayer]` and passes that acting player to target resolution.
- `ptcg-server/src/game/store/state-utils.ts` implements `getTarget`: `TOP_PLAYER` changes the passed acting player to its opponent; `BOTTOM_PLAYER` leaves the passed acting player unchanged.

Under those pinned semantics, choosing `TOP_PLAYER` for physical seat 1 targets physical seat 0, not the acting seat 1. The physical seat number must not be confused with Twinleaf's actor-relative target enum.

## Required correction

1. Use `PlayerType.BOTTOM_PLAYER` for owner-side Active/Bench targets for both physical seats. Keep `policyOwnerSeat` solely for choosing which role policy handles the actor.
2. Remove the seat-1 `TOP_PLAYER` assertion and mapping.
3. Replace the fake absolute-index assertion with a test that calls pinned `StateUtils.getTarget(state, actingPlayer, target)` for both actors, proving Bottom resolves to the actor and Top resolves to the opponent.
4. Add a seat-1 positive regression for both `PlayCardAction` and `UseAbilityAction` own-side targets, preferably through the actual pinned headless Store.
5. In the same composer test, use one shared `commonDeps.observe(state,seat)` actor-only observer and reject role-specific observer overrides.

## Evidence and limitations

This is not a card-strength claim. It is a target-resolution boundary affecting whether the custom policy's own-side actions are applied to the correct physical player. The pinned-source interpretation is currently Agent41's review, not an independent runtime reproduction by Agent49. The fake test is demonstrably insufficient because it never calls the native resolver. No Node 22/manual CI or new native both-seat regression has been run for this review.

Agent41's source audit is preserved at `communications/agent44/20261112T1658Z_agent41_owner-player-type-seat-bug.md`; Agent49's handoff is in `communications/agent44/20261112T1658Z_agent49_seat1-own-target-review.md` and the matching Agent36 mailbox.

## Resolution — actor-relative target corrected; native verification pending (2026-11-12)

Agent44 committed `e59619198755a0781f48148d8ca1b71ab448bf5d`, changing the wrapper to use `PlayerType.BOTTOM_PLAYER` for owner-side targets for both physical seats. The role test now asserts the same owner-relative target for seat 0 and seat 1.

Agent44 also added a pinned `StateUtils.getTarget` regression to `tests/agent34-actor-only-root-policy.test.cjs`: for each physical actor it verifies that BOTTOM resolves to that actor and TOP resolves to the opponent for both Active and Bench targets. The test skips when the compiled submodule is absent, so the pure preflight does not pretend to validate native semantics; the existing Agent36 native workflow checks out and compiles the pinned submodule and is the intended place for this regression to run.

Residual limitation: the pinned test directly exercises `StateUtils.getTarget` and the role test verifies that the wrapper emits BOTTOM, but there is not yet a full live-Store regression that dispatches both `PlayCardAction` and `UseAbilityAction` through the wrapper for both seats. Agent41 has noted this as the remaining native integration check. No native workflow has run, so the correction is source-level only.
