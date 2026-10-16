# Agent 32: rank-6 Iron Thorns Special-Energy pass screen

**16 October 2026.** Same source-locked Aichi six-game diagnostic as [first-turn Shadow Mist audit](agent32-first-turn-shadow-mist-pass.md): [manual CI 38842936054](https://github.com/FlareZ123/experiment-01/actions/runs/38842936054), artifact 12022625370. Paper card-text inspection plus public pre-pass board reconstruction, not a simulator legality proof or win rate.

## Finding

The original Basic-only pass audit reported **zero** printed-cost-covered opponent passes among **97** opponent `PassTurnAction` events. This is incomplete payment accounting because rank-6 Iron Thorns ex uses Special Energy.

Inspecting all 97 opponent pre-pass snapshots and granting the printed Energy provision of **Speed Lightning Energy** (Lightning), **Spiky Energy** (Colorless), **Capture Energy** (Colorless) and **Double Colorless Energy** (two Colorless) identifies **six** passes with enough Energy for Iron Thorns ex's *unmodified* `Volt Cyclone` [Lightning, Colorless, Colorless] cost. All six occur in **one** `hood-shield-v1:B` trial, with the Stadium **Wondrous Labyrinth Prism Star** active.

| Global turn | Action ordinal | Attached Energy |
| --- | --- | --- |
| 21, 23, 25 | 187, 195, 204 | Spiky + Capture + Speed Lightning |
| 31, 33, 37 | 247, 256, 275 | 3 Speed Lightning |

Wondrous Labyrinth Prism Star increases attacks of non-Fairy Pokémon by **one Colorless Energy**. Iron Thorns ex is Lightning; its effective attack cost is thus [Lightning, Colorless, Colorless, Colorless], needing four supplied Energy units. Each of the six observations has **three**, a one-unit shortfall. All have Benched Iron Thorns available, but that does not remove the extra cost.

Across the remaining opponent passes, this scan found no combination meeting the printed Lightning plus two Colorless requirement even before Wondrous Labyrinth. The six first-pass positives therefore disappear after applying the visible Stadium rule. These are six repeated actions within one match, not six independent trials.

## Interpretation

This analysis explains why simply adding Special Energy providers to the Basic-only metric still produces false attack-readiness alerts. Both *energy type/quantity* and *effective costs from Stadiums* must be modeled. A clean public-resource screen remains weaker than a pinned Store attempt because effects, statuses, locks, other attack-cost modifiers and policy action selection are outside the scan.

Card texts inspected from the supplied database: `swsh2-173` Speed Lightning, `sv9-159` Spiky, `swsh2-171` Capture, `sm9-158` Wondrous Labyrinth, plus Double Colorless Energy. Rulebook D-11 confirms stacking attack-cost increases.
