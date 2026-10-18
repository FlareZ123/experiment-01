# Temple v1: compiled Underworld Door to Latias retreat action under Iron Thorns

**Agent 42, 18 October 2026.** A staged midturn, source-print-aware Twinleaf Store test has passed, closing the [Latias/Wobbuffet retreat-action gap](temple-wobbuffet-latias-als.md). This verifies a mechanical transition **only**. There is no source-dealt full game, selected Max Geist attack, independently competent opponent policy, timed event outcome or matchup win estimate.

## Frozen objects and source

- The tested card identities occur without substitution in fixed [Temple Shadow Rider v1](candidate-temple-shadow-rider.json): Wobbuffet PHF36, Latias ex SSP76, Shadow Rider V CRE74 + VMAX CRE75, Basic Psychic Energy, Float Stone BKT137.
- Published Aichi Iron Thorns decks at ranks 6, 24 and 29 each carry Tool Jammer BST136 (the tested opponent printing).
- Pinned upstream Twinleaf submodule `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research-owned reversible `installToolJammerHook` is enabled for the bounded test; vendor code is not changed.
- Executable fixture: [simulation/twinleaf/wobbuffet-latias-retreat-action.cjs](../../simulation/twinleaf/wobbuffet-latias-retreat-action.cjs), included in existing manually dispatched [radiant-gate-engine.yml](../../.github/workflows/radiant-gate-engine.yml).
- **Compiled full workflow: [39105990987](https://github.com/FlareZ123/experiment-01/actions/runs/39105990987), success**, head `7e07ec3d3a40a0006b7140cccf6389902fcfea6a`, 18 October 2026 06:59 UTC. All earlier probe steps passed as well.

## Actual Store actions tested

On a staged owner turn 3, opposing Iron Thorns ex begins Active and our Wobbuffet begins Active, with an already evolved Benched Shadow Rider VMAX bearing two Psychic Energy. When specified, Latias ex is Benched; Float Stone is attached to Wobbuffet; Tool Jammer is attached to Iron Thorns. The actual Underworld Door `PowerEffect` produces `AttachEnergyPrompt`; a dispatched `ResolvePromptAction` attaches a third Psychic Energy to VMAX and draws two cards. A real `RetreatAction(ownerId,vmaxBenchIndex)` follows; each case asserts the computed retreat cost, resulting Active position, Energy retention and new Ability-lock state.

The fixture creates one nonempty synthetic Prize position for **each** player so that the live-turn `checkState` does not enter sudden death after the prompt. Prior failed CI runs were invalid empty-Prize test setups, examined separately in [the cross-fixture diagnostic](../twinleaf/staged-empty-prize-sudden-death-reset.md).

| Latias | Tool Jammer | Float Stone | Retreat cost | Actual retreat | VMAX Energy after Door/retreat |
| --- | --- | --- | --- | --- | --- |
| Yes | No | No | 0 | Succeeds | 3 |
| Yes | Yes | No | 0 | Succeeds | 3 |
| Yes | Yes | Yes | 0 | Succeeds | 3 |
| No | No | Yes | 0 | Succeeds | 3 |
| No | Yes | Yes | 2 | Rejected: `NOT_ENOUGH_ENERGY` | 3 on Bench |
| No | No | No | 2 | Rejected: `NOT_ENOUGH_ENERGY` | 3 on Bench |

All six cases drew exactly **two** cards with Underworld Door before retreat. In four successful retreats, Shadow Rider VMAX became Active with three Energy still attached, Wobbuffet moved to the Bench, opposing Initialization became visible again and the VMAX Underworld Door power became unavailable under that resumed lock. In the two rejected retreats, Wobbuffet stayed Active and Underworld Door remained available. Thus the pinned action-level system distinguishes Latias's Psychic Ability from a Tool Jammer-suppressed Float Stone.

## Scope and interpretation

This is an **already-established-board response capability**, which helps explain an archetype-line interaction that card-by-card power rankings miss. It does not measure how often Temple can obtain Wobbuffet, Latias, V and VMAX together, evolve legally, attach three Energy, survive a possible 140-damage opposing Volt Cyclone, or choose the right actions under Item/Supporter/Bench contention. It does not demonstrate Max Geist being declared or hitting anything after promotion. The [exact narrow resource models](temple-wobbuffet-latias-als.md) estimate restricted setup sightings, not effective full-game execution.

The next discriminating test should use the unchanged Temple v1 and a published Iron Thorns 60 in a genuine source-dealt trial, with actual active-position setup, no hidden-source leakage, an autonomous Wobbuffet-to-Latias decision policy, actual VMAX attack selection and the opponent's consequential response. Include both starting seats and unsuccessful attempts. Preserve raw game/policy/hook/print IDs. A forced midgame board is insufficient evidence of the 99.5% full-field objective.

**Evidence class:** compiled staged-game transition, not a qualified match or win. **Benchmark status remains 29/32 exact opponent lists, zero independently competitive-qualified games, and no target-qualified final deck.**
