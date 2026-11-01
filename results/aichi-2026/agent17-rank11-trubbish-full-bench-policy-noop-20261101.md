# Agent 17: original rank11 Trubbish policy repeatedly selects a zero-effect attack with a payable damaging alternative

**1 November 2026 | direct read-only physical-game, root-linked evidence from original frozen Agent41 v2 archive.** Source: original [compiled native CI 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584) and [artifact 13072623187](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584/artifacts/13072623187), ZIP SHA256 \`cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b\`.

## Printed source and the exact native game evidence

The attached card database's **Trubbish FST 168 / swsh8-168** is a Basic Darkness Pokémon with two printed attacks:

- **Call for Family** for one Darkness Energy: search the deck for a Basic Pokémon and place it onto your Bench.
- **Super Poison Breath** for one Darkness plus one Colorless: **20 damage and Poison** to the opponent's Active.

The supplied advanced player's rulebook **C-11** states that an attack which searches for and puts a Basic onto your Bench ends before deck search when the Bench is full. A full Bench cannot receive a sixth Pokémon. The same Trubbish in the native public board had a **Muscle Band** Tool attached across the 34 cost-payable zero-effect turns. Neither seat's Stadium list contained any active Stadium at those 34 pre-attack snapshots.

Exactly **45 original rank11 source \`Call for Family\` attacks** occurred in the frozen v2 development archive, in **two long games from the same original physical source-deal fingerprint**:

| Native trial | Source Call for Family attacks | With open Bench, selected a Basic | Bench full and search skipped | Full Bench with at least two Basic Darkness attached | Outcome |
| --- | ---: | ---: | ---: | ---: | --- |
| \`11:2:A:champion-reference\` | 23 | 5 | 18 | **17** | Censored at action cap |
| \`11:2:A:new-moon-lockbreaker-v1\` | 22 | 4 | 18 | **17** | Native candidate terminal |
| **Total** | **45** | **9** | **36** | **34** | **0 competitive-qualified** |

The **nine** open-Bench source attacks each emitted a native deck \`ChooseCardsPrompt\` selecting one prospective Basic. All **36** full-Bench source attacks emitted **no deck-selection prompt**, consistent with the attack's printed lack of an applicable Bench target. **34 of the 36** full-Bench attacks nevertheless had **two to four Basic Darkness Energy** attached to Active Trubbish, enough for the *printed base* \`[Darkness][Colorless]\` cost of **Super Poison Breath**, which is explicitly included as a second printed attack in \`sourceAttackSettlement.attacks[].publicBoardBefore[sourceSeat].active.printedAttacks\`. The other two full-Bench attacks had only one Darkness attached, so this particular alternative was not payable on those turns.

For all **34** cost-payable, full-Bench \`Call for Family\` declarations, the original source's public Active was Trubbish with Muscle Band, the other seat's Active was **Girafarig** (17 instances) or **Trevenant & Dusknoir-GX** (17 instances), and the opponent's public Active damage was **0** immediately before the attack. No Stadium was publicly in play. At the level of the recorded basic Energy costs, the source actor repeatedly chose a card-text search attack unable to place any Basic when its same Active Pokémon had a damaging and Poison-producing attack available.

## Exact interpretation and qualification

This is an **observed actor-policy failure on 34 real original native turns**, repeated under one original source physical seed versus two different fixed candidates. It is not 34 independent games and is **not a demonstrated Store legality violation**: announcing Call for Family with a full Bench is permitted as a no-op under the rulebook, and the source bot may have faced additional unstored attack restrictions. The available public board contains no Stadium and the printed Super Poison Breath cost is met; however, the complete effect/attack eligibility and whether a different decision would change the game's winner have **not** been independently replayed.

The record exposes why the original v2 rank11 source bot cannot be treated as a competent competitive pilot. A source robot can burn tens of turns on a functionally empty attack while a plausible printed damaging alternative remains readily payable. The sole New Moon native candidate-terminal outcome in this paired source seed should therefore carry an explicit \`RANK11_TRUBBISH_FULL_BENCH_NOOP_POLICY\` development veto, rather than being advertised as strong victory evidence. This strengthens the interpretation of [the full v2 original/candidate winner breakdown](agent17-v2-fixed-deck-engine-winner-contrast-20261101.md).

**Follow-up recommendation:** In the **single common native policy** for both original rank11 and candidate seats, condition attack selection on own Bench occupancy and the *marginal physical effect*. Do not choose Call for Family when there is no Bench room if an independently verified alternative attack has valuable attainable effects. Record owner-only available attacks, current public printed costs, paper-target availability, and actual selected attack with a non-leaking effect-value reason. Register a prospective identical physical source-deal A/B in a **new versioned policy profile** before interpreting wins. Preserve these 45 original actions in the frozen v2 baseline for reproducibility.

**Global objective status:** 29/32 exact original Top32 opposing lists, no competitive-qualified games, no credible 99.5% single-fixed-deck claim.
