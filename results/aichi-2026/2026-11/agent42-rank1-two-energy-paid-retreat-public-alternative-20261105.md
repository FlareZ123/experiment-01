# Original rank-1 two-Energy paid-Retreat: owner-visible feasibility versus a Float Stone native witness

**Agent 42 | 5 November 2026 | default-off deterministic planning and pure regression, not a native Store counterfactual**

## Research question

Can a reusable owner-visible planner represent the original rank-1 Shadow Rider Calyrex VMAX's **printed two-Colorless Retreat Cost**, without misattributing every useful free Float Stone retreat to an indispensable Tool? The existing [Agent6](../../simulation/twinleaf/agent6-actor-paid-retreat-frontier.cjs) and [Agent10](../../simulation/twinleaf/agent10-flexible-paid-retreat-frontier.cjs) proposals only accept one retreat-cost unit. The [prospective original-source rank1 native receipt](../aichi-2026/2026-11/agent42-selected-v3-rank1-fresh-heldout-native-custody-20261105.md) shows that the exact source position can involve two attached Basic Psychic Energy and a ready three-Energy Benched VMAX.

The source card database in `resources/cards/en/swsh6.json` (corresponding to supplied `card-list.zip`, `swsh6-75`) prints VMAX Retreat Cost as two Colorless and Max Geist as **10+**, plus 30 per Psychic Energy attached across all your Pokémon. This research models that printed arithmetic, with conservative scope restrictions.

## Implementation

[Source module](../../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal.cjs) exports:

- `twoUnitPayment(printings, context)`: find the smallest subset of **physical Energy cards** whose currently modeled units can meet two Colorless. Two Basic Psychic cards pay two units. One Double Colorless Energy pays two units with one physical card. Unknown attached Energy and overlarge states (more than 12 attached cards) fail closed. This method returns owner-visible physical card indices as a **proposed payment**, never claims the Store accepted them.
- `postRetreatPrintedDamage(view, pokemon, attack, removedActiveEnergyIndices, catalog)`: for the exact Shadow Rider VMAX CRE Max Geist, sum the owner's face-up attached **Basic** Psychic Energy and subtract Psychic cards in the proposed payment before calculating `10 + 30 × count`. Unknown Special Energy anywhere on the board causes this Max Geist estimate to fail closed. For unrelated attacks, defer to the existing conservative printed-damage estimator.
- `proposeTwoUnitPaidRetreat(view, catalog)`: choose a funded Benched attacker after verifying the owner has not retreated, knows public state, has an unmodified printed two-Colorless retreat fee and a payable subset of currently attached cards. Public stadiums, an attached Active Tool, known status/retreat/attack locks, unknown special cards, competing payable Active attacks, unsupported damage and weak proposed damage exclude the branch. Return a deterministic **default-off intent** with exact payment indices, Bench target and expected printed pre-modifier damage. No Store action is dispatched; no bot policy is installed.

The implementation reuses current `actor-energy-payability.cjs`, `agent17-public-context-special-energy.cjs`, and `agent6-actor-paid-retreat-frontier.cjs` rather than introducing a second Energy unit or attack-cost system. It reads only the actor's hand-free public board view plus public Energy printing metadata. `opponentPrivate` is not accessed. [Pure tests](../../tests/agent42-public-two-unit-paid-retreat-proposal.test.cjs) include an opposing-hidden-information throw getter and unchanged input snapshot.

## Printed source-state thought experiment

The archived seed **884910343**, source seat1, global turn34 had two Basic Psychic on source Active VMAX, three on the already funded Benched VMAX, and two on Benched Girafarig, after the first Underworld Door. A hypothetical normal paid Retreat discards the two Active Psychic, leaving **five** attached Basic Psychic across the owner's board; the Benched funded VMAX becomes Active.

| State in this strictly hypothetical branch | Total attached Psychic | Printed Max Geist base calculation |
| --- | ---: | ---: |
| Before paying the normal Retreat fee | 7 | 10 + 30 × 7 = **220** |
| After paying two Psychic Energy and promoting funded VMAX | 5 | 10 + 30 × 5 = **160** |
| If another legal Underworld Door subsequently attaches one Psychic to an eligible Bench recipient | 6 | 10 + 30 × 6 = **190** |

The actual **observed** source native selected mode took the Float Stone route and had **eight** Psychic by Max Geist168, hence 250 printed base, one Prize on Lunatone, opposing Unown174 and Klefki Joust175, and later native terminal. The counterfactual's 160/190 figures cannot be substituted into the observed completed game: changing the Retreat action can change targeting, Ability sequencing, hand, hidden draws and later turns. The active source VMAX before Retreat could not itself pay a three-Colorless Max Geist with two Psychic, but **exact current owner-action opportunity, native prompt payment, final attack and opponent reply are still unverified** in this hypothetical alternative.

The tool-preserved two Psychic increased observed potential Max Geist damage by 60 after the second Door, but the actual Lunatone had 80 HP remaining. On printed base arithmetic alone, 160 would suffice for that particular target absent other modifiers. This **does not** prove that the paid alternative is strategically better, executes in native Store, or preserves the observed late six-Prize game sequence.

## Regression status and vetoes

The new [13-case pure suite](../../tests/agent42-public-two-unit-paid-retreat-proposal.test.cjs) is included alongside the existing 27-case Tool/retreat/payoff receipt suite in manually dispatched [Twinleaf completion CI run 41965023492](https://github.com/FlareZ123/experiment-01/actions/runs/41965023492). The dedicated combined test step completed **successfully**; complete workflow status should be checked separately. These tests exercise hypothetical printed public states and the two previously archived native receipt projections. **They are not an executing native two-Energy Store action, a second observed settlement, or a competitive qualification.**

Outstanding checks before any policy promotion: native two-card discard prompt and owner payment reference identity; a real paid Retreat to the publicly identified funded VMAX in the **same physical original deal**; actual attack settlement and Prize change; opponent continuation; all known Stadium/Ability/Tool restrictions; legitimate comparison against other competing actions; same release both-seat selection and error/censor ledger. Do not retroactively claim Tool necessity or increment competitive-game counts.

**Benchmark status remains 29/32 original card-name/count inventories, zero paper-qualified games, no selected single final 60 and no demonstrated 99.5% win rate.**