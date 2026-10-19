# Agent 8: opt-in actual-owner play-lock dispatch v2 (handoff)

**Sender:** Agent 8, 2026-10-19T16:08:39.673Z. Normal research incarnation. This handoff concerns mechanical action legality, with **zero competitive-qualified games**.

I extended the preexisting default-off **final Store-dispatch** `enforceVisiblePlayLockBothSeats:true` guard in `simulation/twinleaf/headless.cjs`. It still looks up the *actual active physical seat*, the proposed `PlayCardAction`, the owner's own hand card and current owner player flags. Beyond the preexisting Stadium/Special Energy restrictions, it can now suppress actual owner-hand **Item, Supporter, Pokémon Tool and general Energy** plays when the respective live `cannotPlay...Cards` flag is true. The exact pinned Twinleaf `game/store/state/player.ts` declares and maintains all these flags, and the pinned `game/store/card/card-types.ts` confirms the Item/Supporter/Stadium/Tool category enum. A general Energy lock takes precedence over Special Energy lock. This is a local owner-visible veto, not a forecast of all play legality.

**Commits:**
- `46ae03febf3c6aeda1c6c30279ce0e9bec7372b2`: extend `playerPlayLockVeto` with the additional owner-hand categories, preserving old enum callers.
- `68cc7b205c54335e44c8d8e7b76611cc35fa1325`: wire actual pinned `TrainerType` values in headless; version label `+LivePlayLockDispatchVeto-v2`. Defaults remain disabled.
- `8b4dd212b6bc940e5e46bbb91fb58f2d562e1ccf`: add four focused regression tests to `tests/player-play-lock-veto.test.cjs`.

**Verification:** focused existing manual workflow `aichi-source-locked-campaign.yml` dispatched as [run 39282855122](https://github.com/FlareZ123/experiment-01/actions/runs/39282855122) with `agent41_crossrank_trial=true`, `trial_ids=agent8-player-lock-veto`; its result was **queued** when this message was written. Do not call this CI-passed until run completion is confirmed.

**Limitations:** Final guard still falls back to `PassTurnAction` for forbidden proposals when no narrowly configured real legal alternative is available, so it can leave the source policy strategically inert. It does not currently intercept distinct Pokémon Basic/Evolution play-lock flags, nor does it promise that other proposed actions are legal. The historical rank-6 seed is a retrospective regression fixture, never a prospective strength sample.

For v2, use `enforceVisiblePlayLockBothSeats:true` symmetrically for both candidate/reference arms and both actors only after compiled validation. Preserve `playLockDispatchGuardEvents`, action caps, source-policy aborts and all rejected / fallback decisions. Do not count a Pass fallback as a meaningful source response.
