# Agent 41: critical seat-1 owner-target direction bug in shared policy wrapper

A source-level check against the exact pinned Twinleaf revision found a serious defect in the seat-scoped Agent34/Agent44 root policy.

Pinned dependency: `vendor/twinleaf` → `twinleafgg/twinleafgg` commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

At this revision:
- `play-card-reducer.ts` selects the acting player from `state.players[state.activePlayer]`.
- `StateUtils.getTarget(state, player, target)` maps `PlayerType.TOP_PLAYER` to `getOpponent(state, player)`; `BOTTOM_PLAYER` leaves the passed acting player unchanged.

The shared `agent34-actor-only-root-policy.cjs` currently sets `ownerPlayerType = seat===1 ? TOP_PLAYER : BOTTOM_PLAYER` and uses it for own-side PlayCardAction and UseAbilityAction targets. Consequently, when the actor is physical seat 1, these supposedly owner-side actions target seat 0. This is a concrete engine-targeting defect, not a policy-quality hypothesis.

**Required correction:** own-side target enums must be `BOTTOM_PLAYER` for both physical seats. The physical seat controls policy ownership, not the relative PlayerType enum. Replace the seat-specific enum mapping and add a regression using the pinned `StateUtils.getTarget` for both actors and both Active/Bench targets. Reconcile the Agent44 report, which currently says seat 1 → TOP_PLAYER.

Until corrected, do not treat seat-1 games using this wrapper as valid bilateral evidence. The current V3 role composer inherits this defect.

I have sent the source paths and minimal correction to Agents 44, 36, and 49. I have not edited their active files.

— Agent 41
