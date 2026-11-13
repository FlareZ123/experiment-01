# Hooded Block funded-bench-attack root proposal

**Status:** default-off owner-view policy proposal; not yet enabled in the V3 candidate manifest and not a demonstrated matchup result.

## Question

Can the Hood Shield Shadow Rider candidate convert a Snorlax PGO Block lock into a legal paid retreat and a funded Benched attack, without consulting opponent hidden information or relying on the full-State retreat scorer?

## Existing mechanics evidence

Agent3's [PR #41](https://github.com/FlareZ123/experiment-01/pull/41), stacked on [PR #38](https://github.com/FlareZ123/experiment-01/pull/38), reports a **14/14 native Twinleaf Store action regression** across seven cases and both physical seats. It verifies that Stealthy Hood on the affected Active allows the two-Energy RetreatAction against Snorlax Block; Hood on the wrong Benched Pokémon does not; opponent Active Tool Jammer and Jamming Tower suppress the protection; and Path to the Peak does not suppress Snorlax Block. This is card-interaction/action evidence, not a game sample.

## Implementation

- Added `simulation/twinleaf/agent43-hooded-block-bench-attack-root.cjs` and wired it into Agent34 root policy v10 behind the explicit `hoodedBlockBenchAttackRoot` option (default off).
- If Hood is already attached to the current Active Shadow Rider Calyrex VMAX, the helper proposes a two-Psychic paid retreat only when a public, funded Benched attack has a nominal KO on the current Snorlax PGO Active.
- If Hood is in the owner's hand and the Active Tool slot is empty, it first proposes attaching Hood to that Active, but only after evaluating the post-attachment line. The native Store must still accept the attachment and the subsequent RetreatAction.
- The proposal reuses Agent42's public payment, attack-block, post-retreat damage and prize-projection helpers; it does not modify Agent42's implementation.
- It rejects opponent Active Tool Jammer, Jamming Tower, unsupported stadiums, Garbotoxin with a Tool, other retreat-lock abilities, missing public metadata, active payable attacks, insufficient Psychic payment, attack locks/statuses, alternate free mobility in hand, and nonlethal attacks. Path to the Peak is allowed because Snorlax PGO is not a Rule Box Pokémon.
- The decision reads only the acting player's hand and the public board. It never reads opponent hand, deck, prizes or other hidden zones.
- The root audit records option opt-in, attachment/retreat selections and seat counts. The option must be bound to the candidate role only and included in the V3 policy identity/receipt.

## Scope and limitations

- The current helper handles the **no-opponent-Active-Tool-Jammer** line only. It does not yet play Field Blower, search Hood with Arven, or resolve the Field Blower prompt. If Tool Jammer is attached to the opponent Active, it declines rather than guessing.
- It handles the specific Snorlax PGO Block / Shadow Rider VMAX / two-Psychic retreat case, not arbitrary retreat locks.
- A projected KO is a public printed-damage calculation, not a native attack resolution. The helper explicitly leaves native attachment, RetreatAction payment, subsequent attack and competitive-game qualification unverified.
- The rank-7 public board snapshot with five Benched Pokémon per player, a Clefairy ex carrying seven Psychic Energy, and Snorlax at 10 damage gives a nominal Full Moon Rondo projection of 220 damage against 140 remaining HP. This is a transparent arithmetic projection, not a replay or a win-rate observation.
- The complete Field Blower → Hood → retreat → attack sequence has not yet been tested in one native game. Agent3 has been asked to extend the existing fixture without duplicating its 14-case matrix.
- The V3 runner integration remains pending with Agent36. Do not enable this option for opponents or compare candidate results until candidate-only policy identity and receipts include it.

## Validation

- Local isolated helper harness with stubbed dependency contracts: 7/7 tests passed.
- Repository test added at `tests/agent43-hooded-block-bench-attack-root.test.cjs`, including both physical seats and the Agent34 action mapping. It has not yet been run against the pinned Twinleaf checkout in this invocation.
- Native Store 14/14 evidence is from Agent3's PR #41 and is separate from the helper tests.
- No complete-game win-rate, matchup win-rate, or 99.5% claim is made.

## Next actions

1. Run the new repository test and the existing Agent34/Agent42 regression suites against the pinned submodule.
2. Complete a native full-sequence fixture, including Field Blower removal of opponent Active Tool Jammer where applicable.
3. Have Agent36 bind the option only to the candidate role and update frozen policy identity/receipt metadata.
4. Evaluate the candidate against the full 32-deck Aichi Top 32 field; report matchup-level results and uncertainty.
