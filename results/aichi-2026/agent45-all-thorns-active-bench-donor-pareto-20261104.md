# Agent 45: Active-versus-Bench Energy funding conflict in all three authentic Aichi Iron Thorns original decks

**4 November 2026 | exact physical-copy combinatorial frontier, no native games run.**

## The decision-design question

The [original Rank6 same-deal native donor replay](agent45-retrospective-both-seat-volt-donor-native-followthrough-20261103.md) shows that preserving enough Active Energy to pay the next Volt Cyclone can convert a Pass into a paid attack, including a two-Prize attack in a selected historical trial. It is tempting to make **preserve-current-Active-printed-cost** an unconditional Energy-donor priority. That ignores what Energy moved *onto the Bench* can enable. The Bench recipient is another original Iron Thorns ex with the same printed attack cost, and funding a replacement attacker can matter more than reattacking with a damaged or otherwise vulnerable Active.

This exact problem is naturally multiaxial. A source-owned Volt Cyclone Energy-choice prompt can produce distinct post-attack resource outcomes for the current attacker and its prospective backup. The evidence must retain both outcomes before a policy decides their game-state priorities.

## Exhaustive two-attacker method

The [read-only Pareto classifier and census](../../simulation/evaluation/aichi-thorns-two-attacker-donor-pareto.cjs) enumerate the three original Aichi source 60s at ranks 6, 24 and 29, preserving each of the eight distinct physical Energy-copy positions. For every `C(8,3) × C(5,1) = 280` board allocation, assume three of the eight Energy copies attached to an Active Iron Thorns ex and one different Energy copy attached to an own Benched Iron Thorns ex. For every one-card donor from the Active, calculate the printed Lightning+Colorless+Colorless attack payment independently on the *post-transfer Active* and *post-transfer Bench*, under one unchanged public Stadium (no Stadium, Thunder Mountain Prism Star or Wondrous Labyrinth Prism Star). Copies are assigned to different Pokémon in ordered physical roles; identical printed names can still represent different physical copies.

A **two-attacker funding conflict** is counted only if the original Active pays its printed attack cost and there is at least one available donor that preserves the Active's payable status, and at least one donor that makes the Bench payable, **without any single donor achieving both**. Thus the conflict is a genuinely nondominated two-boolean objective choice in this simplified printed-cost model. It does not claim equal worth of attackers, full tactical equivalence, complete legal prompt resolution, Bench occupancy probability, tool/Ability effects, or any match outcome.

Five independent positive/negative CommonJS regressions in [the test suite](../../tests/agent45-aichi-thorns-two-attacker-donor-pareto.test.cjs) passed locally with Node 22.16.0; **no GitHub Actions native game or remote test certification is claimed**. The counts were also checked by a separate Python exhaustive enumeration of physical positions.

## Exact results

| Original source | Three-Active / one-Bench physical allocations | Original Active printed-cost payable | Genuine two-attacker funding conflicts | Allocations with some donor keeping **both** attackers payable |
| --- | ---: | ---: | ---: | ---: |
| Rank 6, Kazuma Kashi | 280 | 260 | **48** | 0 |
| Rank 24, Ryoya Fujii | 280 | 260 | **108** | **72** |
| Rank 29, Kohei Hamamichi | 280 | 260 | **48** | 0 |

These figures assume **no Stadium**, a physically present eligible Benched Iron Thorns, no outside attack-cost modifiers and **one** after-attack Energy transfer. Under those conditions, **48/260 = 18.46154%** of initially payable Rank6/29 physical allocations have an intrinsic Active-versus-Bench funding conflict, compared with **108/260 = 41.53846%** for Rank24. In a different 72 of the Rank24 payable allocations there is an actual donor that leaves *both* attackers funded. Those 72 configurations are absent from Rank6/29's exact eight-Energy composition under the stipulated Active3/Bench1 assignment.

Under **Thunder Mountain**, all 280 allocation cases for each original source start with a payable Active and contain a donor retaining **both** attackers' printed payment. No simple two-attacker conflict exists. Under **Wondrous Labyrinth**, no post-transfer pair can reach either printed cost in this tightly constrained Active3/Bench1 sample, so no genuine two-way conflict is counted. Neither Stadium statement extends to changes in effects, Tool reductions, already damaged Pokémon or broader boards.

## Physical printed-card examples

**Rank6 and Rank29 original-reachable example:** Active `Speed Lightning + Speed Lightning + Double Colorless`; Bench `Speed Lightning`; no Stadium. Moving one Speed Lightning preserves `Speed Lightning + Double Colorless` on Active, paying LCC, but leaves the Bench only two Speed Lightning, below its three-unit cost. Moving Double Colorless makes Bench `Speed Lightning + Double Colorless` attack-ready, but leaves the Active with two Speed Lightning and insufficient total units. Neither donor is universally preferable from Energy payment alone.

**Rank24 original-reachable example:** Active `Speed Lightning + Double Colorless + Capture`; Bench `Double Colorless`; no Stadium. Moving Capture preserves Active payment and leaves the Bench without a Lightning source. Moving Speed Lightning gives the Bench `Double Colorless + Speed Lightning` and makes the Active unable to pay. Moving the Active's Double Colorless funds neither. The three choices produce distinct strategic resource portfolios without changing deck composition, an example made possible by Rank24's three original Double Colorless copies.

## Consequence for a real source policy

A generalized owner-only donor planner must receive **current Active's exact physical Energy, intended own Bench recipient's exact physical Energy, applicable public Stadium and attacker status** at the real prompt. It should retain or compare the available nondominated resource states, and then evaluate opposing damage threats, attacker survivability, move/retreat routes, useful Special Energy effects (including Spiky feedback), alternate Bench recipients and next-turn attack payoffs. The Boolean payable frontier is only a necessary resource descriptor, not a sufficient payoff function. The earlier selected Rank6 Active-preservation improvement is a valid narrow causal witness and **should remain a positive control**, while the new exact counterexamples show why promoting the narrow rule to a universal strategic priority would be unsound.

The existing general [three-card donor census](agent45-all-thorns-physical-donor-choice-census-20261104.md) and direct [first-eight visibility model](../../simulation/evaluation/aichi-thorns-first8-donor-resource.cjs) further limit interpretation: allocations from uniform physical-copy enumeration do **not** have measured real-board frequencies. Proving a later actual move requires source-owned prompt validation, real physical transfer, next attack, opponent reply and payoff under one common bilateral policy.

**Benchmark status:** 29/32 original printed decklists authenticated, ranks 23/25/28 missing, zero competitively qualified full paper games, no credible fixed-sixty 99.5% claim.
