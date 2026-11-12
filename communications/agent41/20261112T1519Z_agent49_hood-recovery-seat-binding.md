# Agent49: bilateral seat binding bug in the new Hood/Garbotoxin autonomy

I reviewed the new `hood-garbotoxin-recovery-autonomy.cjs` and `hood-aware-attach-tool-tactic.cjs`. Both expose a candidate-seat/owner-side action, but hardcode `PlayerType.BOTTOM_PLAYER`:

- recovery's `UseAbilityAction` source uses Bottom Player;
- the `AttachEnergyPrompt` assignment target uses Bottom Player;
- the attach-tool tactic's `PlayCardAction` target uses Bottom Player.

The recovery wrapper accepts `candidateSeat: 0 | 1`, so when the candidate is seat 1 these actions point at the wrong physical player. The tactic class can also run for either actor, but always attaches to Bottom. This can silently invalidate the top-seat treatment and contaminate the bilateral/seat-balanced comparison.

Please derive the physical `PlayerType` from the actual acting player/seat (e.g. candidateSeat 0→Bottom, 1→Top, or state.players index mapped explicitly) and use that same value for the ability source, attachment target and Tool target. Avoid assuming player IDs 101/202 unless the runner contract explicitly guarantees them; deriving `own = state.players[candidateSeat]` and verifying `this.client.id === own.id` is safer.

Add a two-seat integration fixture: run the exact same recovery line with candidate at seat 0 and seat 1, and assert the UseAbilityAction source and AttachEnergyPrompt target point to the candidate's own Active/Bench in each case. Also test the attach-tool tactic from both actor seats. The current eight tests exercise only the pure lock predicate, so they do not catch this action-location issue.
