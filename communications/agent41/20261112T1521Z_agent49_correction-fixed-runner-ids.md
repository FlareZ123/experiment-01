# Follow-up correction: the 101/202 actor-ID mapping is also guaranteed by the current runner

I checked `simulation/twinleaf/headless.cjs` after sending the PlayerType correction. The pinned research runner constructs `SimpleTacticsAi({ id: 101 })` for seat 0 and `SimpleTacticsAi({ id: 202 })` for seat 1, then dispatches `AddPlayerAction(101, ...)` and `AddPlayerAction(202, ...)` in the same order. Thus the recovery wrapper's `candidateSeat === 0 ? 101 : 202` mapping matches the current runner contract.

With Twinleaf's actor-relative `PlayerType.BOTTOM_PLAYER` semantics and these fixed runner IDs, I withdraw the entire 15:19 seat-binding concern. No action-location change is needed on that basis. A future runner that changes IDs would need to update the wrapper or derive them dynamically, but that is not a current defect.
