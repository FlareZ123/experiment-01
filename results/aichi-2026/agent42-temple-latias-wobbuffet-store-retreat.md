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

## 18 October compiled attack-conversion follow-up

The original report preceded a direct Max Geist attack-resolution extension. The current [same Store fixture](../../simulation/twinleaf/wobbuffet-latias-retreat-action.cjs) now dispatches a real `AttackAction(ownerId, 'Max Geist')` **after** each successful Underworld Door / Latias-or-Float-Stone retreat, checks that the Store's `playerLastAttack` names Max Geist, resolves outstanding `WaitPrompt` actions, and asserts **100 recorded damage** on the opponent's Active Iron Thorns ex. The unchanged four successful-retreat branches all hit for 100; the two failed-retreat branches execute no attack. [Manual pinned-source compiled CI 39106874079](https://github.com/FlareZ123/experiment-01/actions/runs/39106874079) passed at repository head `248a013cf1c3c6ab69486fd213c07f803c366994`; its targeted job printed all six `attackDamage` fields and no failing assertions. The immediately preceding [attempt 39106667624](https://github.com/FlareZ123/experiment-01/actions/runs/39106667624) failed before its wait-prompt resolution was corrected. This later success supersedes the earlier statement that no Max Geist declaration had yet been demonstrated **for this staged fixture only**.

The observable arithmetic is consistent with the printed Max Geist attack: `10 + 30 × 3 = 100` for exactly three attached Psychic Energy in the staged game. Against the printed 230 HP Iron Thorns ex, a clean one-hit Knock Out through Max Geist would need **at least eight Psychic Energy in play** (`10 + 30 × 7 = 220`, `10 + 30 × 8 = 250`), before considering other damage modifiers or prior damage. No such eight-Energy state was observed. After the retreat, Wobbuffet is Benched, Initialization is once again active, and Underworld Door becomes unavailable: the staged route produces a paid attack yet fails the immediate Knock Out and shuts off its own prior Energy-acceleration engine. A subsequent opponent decision or Volt Cyclone reply has not been executed in this fixture.

**Evidence distinction:** printed card arithmetic + compiled staged Store action resolution, **not** authentic source-dealt setup or human-equivalent attacker policy. The source lists, both true starting orders, full opponent response, complete replay fidelity, and paper clock remain unqualified. The qualified-competitive-game count remains zero.

## 18 October independent in-play Energy-placement threshold extension

**Compiled CI [39160472629](https://github.com/FlareZ123/experiment-01/actions/runs/39160472629) passed** at research revision `afac6a8e8f643aca413e4df6dcd47bfe90b2e1e9`, against the same pinned Twinleaf submodule and reversible Tool Jammer hook. The expanded [same eight-case fixture](../../simulation/twinleaf/wobbuffet-latias-retreat-action.cjs) retains its six previous controls and adds **one Physical Psychic Energy attached to Active Wobbuffet** before Underworld Door. After real Door plus prompt resolution attaches the third Psychic to Benched VMAX, a **zero-cost** actual retreat moves the Psychic-energy-bearing Wobbuffet to the Bench and promotes VMAX. Two added independent route configurations test `Latias present + opposing Tool Jammer` and `Latias absent + active Float Stone without opposing Tool Jammer`.

The manual CI's full pinned Store response was:

| Staged route and Energy placement | Successful retreat? | VMAX-attached Psychic | Other in-play Psychic | Actual Max Geist damage |
| --- | --- | ---: | ---: | ---: |
| Four original free-retreat controls | Yes | 3 | 0 | **100** each |
| Two original blocked-retreat controls | No | 3 on Bench | 0 | No Max Geist |
| Latias free retreat through active Tool Jammer; Psychic on Wobbuffet | Yes | 3 | 1 | **130** |
| Float Stone free retreat without Tool Jammer; Psychic on Wobbuffet | Yes | 3 | 1 | **130** |

The outcome confirms that Max Geist counts Psychic Energy attached to *all of the player's Pokémon*, including a Wobbuffet that has just retreated to the Bench. With Iron Thorns ex's printed 230 HP, an unchanged two-attack sequence of 130 would total 260 and achieve a two-hit KO **if** the same undamaged target remained and attacks/effects could be repeated. The original 100 requires three unmodified attacks. Printed arithmetic: `10+30×3=100`, `10+30×4=130`. This is a discrete attack-count threshold for a *possible* two-turn sequence, not an experimentally established second attack or Prize-taking result.

**Important temporal/AMR constraint:** The additional Wobbuffet Energy is **preloaded in an established staged board** and cannot be assumed to appear for free during Temple's first two ordinary turns. Building three Energy on VMAX plus one on Wobbuffet may require extra acceleration or another turn beyond the first two regular hand attachments and one Underworld Door. Neither eight-branch staged fixture executes a second Max Geist nor any opponent decision, Energy denial, switching, Stadium replacement or Volt Cyclone. Source-hand legality and competitively qualified wins remain unproven.
