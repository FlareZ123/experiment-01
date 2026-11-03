# Agent 2: the fourth Boost Shake reduces two-axis early lock access despite increasing Muk access

**3 November 2026 | exact combinatorial calculation | zero games; no selected best fixed 60.** This is a structural falsification screen for two *unchanged, registered 60s*. The [source 3 Shake / 3 Quick list](agent43-apex-alchemy-paper-expanded-v0.json) and [one-card challenger 4 Shake / 2 Quick](agent2-apex-alchemy-shake4-quick2-v1.json) differ by exactly one copy of each Item, with all other card identities and counts held fixed. The registered canonical SHA-256 for v0 is `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769`; the v1 SHA-256 is `5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0`.

## New joint result

The previous separately calculated **Muk** and **Budew** opening opportunities are independently reproduced, while the **union**, **overlap**, and **same-Quick-Ball contention** are now calculated using one joint Prize complement. These are probabilities **conditional on at least one Basic in the real initial seven**. That condition holds with exact probability 80.93533073% in either 60.

| First-eight hypothetical access event | v0: 3 Shake / 3 Quick | v1: 4 Shake / 2 Quick | v1 minus v0, percentage points |
| --- | ---: | ---: | ---: |
| Muk via Boost Shake | 20.12400842% | 23.76699105% | **+3.64298263** |
| Budew direct or via Quick Ball | 41.50397560% | 34.01388181% | **-7.49009379** |
| **At least one early-lock option** | **51.79476939%** | **48.10564588%** | **-3.68912351** |
| Both hypothetical opportunities | 9.83321464% | 9.67522699% | -0.15798765 |
| Both with distinct available search connectors | 6.78508190% | 6.79008238% | +0.00500048 |
| Both only hypothetically reachable through a single shared Quick Ball | 3.04813274% | 2.88514461% | -0.16298813 |
| Muk only | 10.29079379% | 14.09176407% | +3.80097028 |
| Budew only | 31.67076097% | 24.33865483% | -7.33210614 |
| Neither option | 48.20523061% | 51.89435412% | +3.68912351 |

**Decision:** The intuitive claim that a fourth Shake automatically makes the opening lock package more consistent fails under the broader *either-option* access proxy: the probability of seeing **neither** idealized line grows by 3.6891 percentage points. This does not prove v0 has a higher game win rate, since Muk and Budew have different conditional value, timing and costs. Retain v1 as a falsification challenger. Do not promote it on the Muk-only marginal.

## Exact method, dependency and conflict boundary

We enumerate **eight seen cards**, distinguishing the eighth-card turn draw from the actual initial seven, followed by the **six distinct face-down Prizes** among the unseen 52 cards. Fixed disjoint categories, in order, are: 2 Grimer, 2 Muk, 3/4 Shake, 4 Mysterious Treasure, 3/2 Quick Ball, 1 Budew, 9 other Basic Pokémon, and 36 remaining cards. Each eight-card category state has integer multiplicity `product C(population_i, seen_i)`. Condition on an actual legal opening seven by summing over the identity of the eighth card with multiplicity `seen_i`; this retains the necessary non-Grimer Basic starter distinction. Prize counts for unseen Grimer, Muk and Budew are enumerated **jointly**, with the remaining Prize slots drawn from all other unseen cards. The common exact integer denominator is `8*C(60,8)*C(52,6) = 416717869162795200`; the Basic-valid numerator is `337271985613442880` in both lists.

- **Muk route:** at least one Shake in the first eight; one Muk still searchable after six Prizes; a Grimer held in the first eight or reachable via held Treasure/Quick Ball with an unprized remaining Grimer; and a non-Grimer Basic in the actual initial seven to enable the bench plan. Muk *in hand alone* is insufficient for a Shake deck search.
- **Budew route:** Budew held in the first eight, or Quick Ball held while Budew remains unprized in the deck. Mysterious Treasure cannot search this Grass Basic.
- **Same-Quick conflict:** Budew and Grimer are both absent from the first eight, the held hand has **exactly one Quick Ball and zero Treasure**, and the two searches are individually available. They cannot both be fulfilled using that same Quick Ball. Cases with two Quick Ball copies, or a spare Treasure for Grimer, avoid this specific connector collision.
- **Reproduction:** [exact-integer Node module](../../simulation/evaluation/agent2-alchemy-two-axis-joint-first8.cjs) and [invariant/marginal regression](../../tests/agent2-alchemy-two-axis-joint-first8.test.cjs). This BigInt implementation is independent of the earlier floating-point marginal calculators. An additional Python `math.comb` exact-integer enumeration independently reproduced the same numbers to eight decimal places. The tests check both earlier marginal baselines and the partition identities `M+B-both=either`, `both=compatible+conflicted`, and `M-only+B-only+both+neither=1`.

## Strategic limits and follow-up

This is a **resource opportunity upper screen**, not a simulation or estimated win rate. Quick Ball and Mysterious Treasure require **actual discard payment**; each may be reserved for Regidrago or another line; and there may be no effective Active mobility to declare Budew's Itchy Pollen. Boost Shake **ends the turn** after enabling Muk, precluding a same-turn Budew attack. Opponent Item lock, Ability lock, available Bench slots, Supporter choice, K0 versus K1 information and the opponent's prize race can all reverse the desirability of either path. The “both available” metric means two *hypothetical alternatives or search-access routes*, not both effects executed in the same turn.

**Next causal test:** on the same original printed opponent physical deals, preregister a symmetric owner-visible choice between first-turn Budew Item lock and paid Grimer → Muk Boost Shake when both are physically and legally reachable. A fixed turn-two conversion endpoint and a competent original-source response are required before ranking these 60s. Current full-field evidence remains **29/32 original lists authenticated, ranks 23/25/28 missing, zero paper-competitive games and no demonstrated 99.5% win rate**.
