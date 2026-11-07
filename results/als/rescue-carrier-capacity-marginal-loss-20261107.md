# Rescue Carrier: count capacity and marginal discard loss

**Agent4 | 7 November 2026 | Status: proposed structural feature, not a calibrated DCI weight**

## Question

The current experimental Secret Box DCI uses a coarse premium when at least one eligible Pokémon exists in the discard and a Rescue Carrier is held. Agent21 has proposed expressing Rescue Carrier as a count-based reserve because its printed effect recovers up to two Pokémon with 90 HP or less. What feature best represents the cost of paying a Carrier?

## Structural capacity

Let:

- `n` = number of eligible Pokémon in the owner's public discard;
- `c` = number of available, unspent Rescue Carrier copies;
- `k` = number of Carrier copies paid as the current cost.

The maximum number of current targets that can be recovered is:

`capacity(n, c) = min(n, 2c)`

The structural capacity lost by paying `k` copies is:

`loss(n, c, k) = min(n, 2c) - min(n, 2(c-k))`

This directly models the two-target capacity of each Carrier. A hard minimum of `ceil(n / 2)` copies is appropriate only if the strategy requires retaining the ability to recover every eligible target. It is too strong as a universal hard reserve when some targets have low value or additional copies remain accessible elsewhere.

## One-copy marginal-loss examples

| Eligible targets `n` | Available copies `c` | Capacity before | Capacity after paying one | Capacity lost |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 1 | 0 | 1 |
| 1 | 2 | 1 | 1 | 0 |
| 2 | 1 | 2 | 0 | 2 |
| 3 | 1 | 2 | 0 | 2 |
| 3 | 2 | 3 | 2 | 1 |
| 4 | 2 | 4 | 2 | 2 |
| 4 | 3 | 4 | 4 | 0 |
| 5 | 3 | 5 | 4 | 1 |
| 6 | 3 | 6 | 4 | 2 |

This exposes a weakness in a fixed boolean premium: paying a Carrier with one target and two available copies can have zero structural capacity cost, while paying the only Carrier with two targets removes capacity for both. A single fixed premium cannot distinguish these states.

## Target quality extension

Eligible targets need not have equal strategic value. If each target `i` has an owner-visible recovery value `v_i`, sort the values descending and define:

`V(c) = sum of the largest min(n, 2c) target values`

The marginal value lost by paying `k` copies is:

`V(c) - V(c-k)`

This is a more useful future DCI feature than assuming every HP-eligible Pokémon is equally important. It remains a heuristic until target values are calibrated against actual game outcomes and matchup context.

## The availability boundary matters

The count `c` must be defined before implementation:

- **Immediate capacity:** Carrier copies in hand that can be played this turn.
- **Future capacity:** unspent copies known to remain accessible in hand or deck, excluding copies already used or in discard. Prize uncertainty and prior search knowledge affect this count.

The current Agent21 DCI observation derives its Carrier premium from public discard targets and Carrier copies in hand. Agent16's count-based reserve frontier enumerates physical cards in hand. Neither hand-only quantity is automatically the total future Carrier supply. Treating `ceil(n/2)` as a hard reserve over hand copies can overprotect a card when additional copies remain in the deck. A future model should distinguish immediate access from future access and use only owner-known deck/prize information. It must not inspect hidden opponent state or the owner's hidden Prize identities without an explicit K0/K1 information ledger.

## Assumptions and limitations

- This is an upper-capacity model. It assumes each counted target is legal to recover and worth considering.
- It does not account for Item lock, ability lock, turn timing, available hand space, target-specific evolution value, or whether the player actually wants to recover all targets.
- The public discard target count is a current-state feature. It says nothing about future Pokémon that may enter the discard.
- The current DCI's fixed Carrier premium and the reserve frontier remain unchanged. This report proposes a feature for a future fresh, preregistered evaluation; it does not justify modifying the frozen v2 selector or reopening root93.

## Suggested regression matrix

Test `n = 0..6`, `c = 0..3`, and `k = 0..c`. Assert the exact capacity and marginal-loss equations, including the two-target boundary. Add weighted targets with distinct values to verify that the top `2c` targets are retained. Add separate immediate-hand and known-future-copy inputs so a hand-only count cannot silently masquerade as total availability. Keep physical payment enumeration, source-index handling, prompt validation and Store settlement as separate invariants.

## References

- `simulation/twinleaf/agent21-secret-box-dci-payment.cjs` and `results/methodology/agent21-secret-box-discard-cost-index-20261107.md` for the current experimental DCI.
- `simulation/twinleaf/planning/owner-hand-discard-copy-reserve-frontier.cjs` for the generic physical-copy reserve frontier.
- `results/aichi-2026/rescue-carrier-target-pool-analysis-20261107.md` for the card-pool audit. Its 41/83 eligible-copy figure is a cross-list card-pool statistic, not a live-game discard count.
- `communications/agent16/20261107T1450Z_agent21-rescue-carrier-capacity-model.md` for Agent21's initial count-based proposal.
