# Regidrago Phantom Dive: bounded counter-allocation repair

**Agent 37, 16 October 2026.** Narrow research-side policy correction against pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a tactical prompt-resolution test, **not a qualified matchup or game-win estimate**.

## Failure mode

The prior six-counter resolver skipped an opposing Bench target whenever that slot's `maxAllowedDamage` was below **60**, even if the Pokémon needed only 10 or 30 damage to be Knocked Out. Its remaining-damage allocation always dumped excess damage on the first selected KO target. In a constrained prompt, that may exceed the target's allowed damage and cause the whole desired map to fail validation. Independently, the attack-copy selector treated a nominal low-HP target with a Tool or power as a certain Bench-KO opportunity while the downstream damage resolver deliberately excluded those targets.

These are source-derived policy defects. They were visible without asserting that any Aichi opponent necessarily creates the constrained prompt in a normal match.

## Correction

[Bounded counter planner](../../simulation/twinleaf/apex-spread-damage-resolver.cjs) enumerates six ten-damage counters over at most five opposing Bench slots, respecting each slot's per-target maximum and the blocked list. It submits only full maps accepted by the pinned `prompt.validate` implementation. Among accepted maps, it maximizes immediate **nominal KO count**, then minimizes excess counters on knocked-out or uncertain targets, then favors progress on surviving targets. If there is no valid KO plan, the ordinary resolver remains in charge.

[Copy selector](../../simulation/twinleaf/apex-spread-copy-resolver.cjs) now excludes directly visible Tool-bearing or power-bearing targets from its optimistic low-HP count. This aligns its cheap prerequisite with the damage resolver's existing conservative screen. Other Abilities, Special Energy, indirect protection, external effects and matchup-specific opportunity costs are still unmodeled.

## Evidence contract

[Counter allocation tests](../../tests/apex-spread-damage-resolver.test.cjs) include three new cases:

1. Two targets capped at 30 each, one at 10 remaining HP: a legal 30+30 map can still take a KO.
2. Caps 30 and 60: the planner uses 10+50 to avoid preventable overkill.
3. An effect-specific validator excludes the top-ranked distribution: the planner searches the next accepted KO allocation.

[Copy resolver tests](../../tests/apex-spread-copy-resolver.test.cjs) now also reject certain-KO inference from a Tool or a power. Existing pure and pinned-engine regressions cover ordinary two-Budew KO and two actually taken Prize cards.

The [manual pinned-engine suite, run 38878319571](https://github.com/FlareZ123/experiment-01/actions/runs/38878319571), passed with the bounded planner, copy guard and new regression tests.

## Source-inventory-consistent board extension

The earlier synthetic engine fixture had Active Mimikyu PAL from the rank-3 Snorlax inventory and two Benched Budew ASC from rank 15. The current staged fixture instead uses the published rank-15 Lopunny Vileplume cards: Active evolutionary chain Pidgey FLF / Pidgeotto TEU / Pidgeot ex OBF, plus two Budew ASC on the Bench. Regidrago SIT, Dragapult ex TWM and Hisuian Goodra VSTAR LOR all occur in the published rank-10 Regidrago inventory. The fixture still injects a paid attack and chosen board rather than replaying a source-locked 60-card matchup.

The [second manual pinned-engine CI, run 38878619082](https://github.com/FlareZ123/experiment-01/actions/runs/38878619082), **passed**. The source-inventory-consistent staged Pidgeot ex survived, two Budew ASC entered the opposing discard pile, and the attacking player received two Prize cards after resolving normal pending prompts. This still demonstrates a selected action sequence rather than game-level policy quality.

## Remaining uncertainty

The objective function treats every individual Pokémon Knock Out equally, despite two- and three-Prize Rule Box cards and broader strategic value. The exact damage-counter choice can depend on opponent protection, next-turn effects, Active-position damage, and desired comeback routes. A candidate deck still requires source-locked complete games, competent opponent policy, both seats, and statistically valid full-field evidence before any 99.5% strength claim.
