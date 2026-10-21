# Native owner Supporter usage is a count; Energy attachment uses a turn stamp

**Agent 8 | 21 October 2026 UTC | evidence class: pinned-source semantic audit and regression tests.** This is a rules-and-implementation correction, not a completed competitive game or candidate improvement.

## Pinned implementation and paper contract

The repository pins Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Direct inspection of its `ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts` establishes that a genuinely played ordinary Supporter increments `player.supporterTurn += 1`. The paper quota guard in `simulation/twinleaf/paper-supporter-quota-guard.cjs` rejects another ordinary Supporter when the same-owner-turn count is at least 1. The supplied Advanced Player's Rulebook B-03 allows one Supporter per turn.

By contrast, pinned `ptcg-server/src/game/store/reducers/play-card-reducer.ts` sets `player.energyPlayedTurn = state.turn` when using the normal hand Energy attachment, and checks equality to `state.turn` to deny a second such attachment. The same pinned reducer uses a global-turn marker for Stadiums. These counters have different time domains and must not be compared interchangeably.

Pinned `ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts` historically treats `supporterTurn` as a global turn number, itself a known bot defect. Research-owned `supporter-decision-hook.cjs` and `supporter-proposal-paper-quota.cjs` already mitigate aspects of that native policy. This finding independently targets research-owned branches that copied the mistaken comparison.

## Two definite errors and correction

1. `simulation/twinleaf/new-moon-rank6-lillie-turn5-fork.cjs`: historical source T5 Lillie counterfactual used `assert.notEqual(player.supporterTurn,state.turn,...)`. At `state.turn=5`, an already used Supporter gives `supporterTurn=1`; the old assertion incorrectly passes. Replaced with a check using `supporterAlreadyUsed(player)`, which rejects any count at least 1.
2. `simulation/twinleaf/rank15-bus-native-retreat-policy.cjs`: the native before/after owner-context snapshots used `actor.supporterTurn===state.turn`. They could falsely record `ownerSupporterUsed:false` late in a turn where a Supporter had actually been played. Both read-only snapshots now use `ownerTurnResourceUsage(state,actor)`, retaining the existing `ownerSupporterUsed` and `ownerManualEnergyAttachmentUsed` fields while separately applying their correct time semantics.

A new minimal research-owned module `simulation/twinleaf/owner-turn-resource-semantics.cjs` makes the intended count versus timestamp distinction explicit. The regression in `tests/rank15-bus-native-retreat-policy.test.cjs` checks cases for global turns 5, 18 and 22 with Supporter counts 0/1 and Energy stamps for the current/previous turn. The already-manual `.github/workflows/aichi-benchmark-stats.yml` runs this regression as part of its normal stat-check job.

| Owner state | Correct Supporter-used reading | Correct normal Energy-attached reading |
| --- | --- | --- |
| Global turn 5, Supporter count 0, Energy stamp 4 | false | false |
| Global turn 5, Supporter count 1, Energy stamp 5 | true | true |
| Global turn 18, Supporter count 1, Energy stamp 17 | true | false |
| Global turn 22, Supporter count 0, Energy stamp 22 | false | true |

## Reproducibility and limitations

The two corrected branches remain opt-in historical experiments; their original native games have **not** been rerun in this result. The fix in the T5 fork changes a precondition check for an illegal double-Supporter scenario, and the rank15 change corrects observability only. No rerun, Prize result or win-rate improvement is inferred from those code modifications.

The comparison is exhaustive for the two located wrong uses; it is **not** a proven comprehensive absence-of-bugs audit for every script or external policy. Do not combine counts and global turn stamps when extending any source/actor root proposal. Both-seat paper quota should stay an independent live Store fail-closed guard.

Global benchmark state remains 29 of 32 exact Aichi opponent 60s (ranks 23, 25, 28 missing), zero competitively qualified games, and no validated fixed-60 99.5% game win rate.
