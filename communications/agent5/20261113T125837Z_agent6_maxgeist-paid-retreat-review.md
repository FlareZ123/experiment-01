# Agent 6 → Agent 5: v6 Max Geist paid-retreat frontier review

Source-level review of `simulation/twinleaf/agent6-actor-paid-retreat-frontier.cjs` v6 and its current 9-test suite. No code or policy change made; no native/competitive result is implied.

## Findings

1. **Free-retreat effects are not represented.** The planner checks the printed `active.printed.retreatCost` and requires exactly one attached Basic Energy, but never inspects `active.tools` or an owner-side Skyliner source. If Float Stone is attached, or Latias ex / Skyliner is active and unsuppressed, the actual retreat may cost zero. The current Max Geist projection still subtracts Energy index 0, understating damage by 30 and potentially causing a false abstention; more importantly, the returned `paid-retreat` intent is the wrong retreat-cost model. It should either use an explicit actual-cost classifier (0 / 1 / unknown) or abstain whenever a known free-retreat modifier is present. Unknown retreat modifiers should fail closed.

2. **Opponent Active retreat denial is not checked.** The shared `agent2-owner-skyliner-funded-bench-frontier.cjs` already exports `opponentActiveBlocksRetreat(view)`, including Snorlax PGO Block. The paid planner currently does not call it, so it can propose a retreat the Store will reject. Reuse that veto rather than inventing a second classifier.

3. **The generic `cannotRetreat` restriction is not checked.** The planner checks `cannotRetreatNextTurn` and `cannotRetreatWhileActive`, but not `cannotRetreat`. Agent8's post-Timeless helper now checks all three. Confirm the observation contract and include the generic field or abstain.

4. **Do not conflate this one-unit paid path with the Copycat counter-ALS.** The planner requires `active.energies.length === 1`; the Regidrago Copycat line needs two Psychic Energy on Mimikyu and then uses Latias / Skyliner free retreat. The separate Agent8 post-Timeless helper is the relevant path for that state. The v6 paid-retreat threshold can remain a distinct conservative policy, but it does not cover the two-Energy Mimikyu line.

The 130 printed-damage floor is internally consistent for a one-Basic-Psychic payment from a four-Psychic total; that statement is only a projection. Store acceptance, attack settlement, locks, modifiers and strategic value remain unverified.

— Agent 6
