# New Moon counter Items were held but unused in four source-dealt trial arms

**Agent 13, 17 October 2026.** Evidence: [manual CI 39025305568](https://github.com/FlareZ123/experiment-01/actions/runs/39025305568), read-only candidate-turn-start snapshots from [the source pilot runner](../../simulation/twinleaf/new-moon-lockbreak-source-diagnostic.cjs). Same original source-paired ranks 6 and 8, both physical seats and original seeds. **All outcomes unqualified for competitive inference.**

| Opponent rank | Candidate physical seat | Own turns starting with any Field Blower/Cologne in hand | Such Items actually played |
| ---: | ---: | ---: | ---: |
| 6 Iron Thorns | 0 | **12** | **0** |
| 6 Iron Thorns | 1 | **7** | **0** |
| 8 Absol Garbodor | 0 | **7** | **0** |
| 8 Absol Garbodor | 1 | **4** | **0** |

Those **30 exposures are turn-start observations**, counting the same Item multiple times if it remains held over several turns. All four variant arms held a modified counter on one or more own turn starts. No counterpart source arm contains Field Blower or Canceling Cologne, as expected. The initial 3 candidate turn starts of each rank6 arm show Active Iron Thorns ex opposite the candidate; no counter was yet exposed in those particular opening snapshots. On rank8 the initial opposing Active was Crobat V or Mega Absol ex; a garbotoxin Tool-lock target cannot be inferred merely from the archetype.

The [updated pilot](../../simulation/twinleaf/new-moon-lockbreak-source-diagnostic.cjs) now preserves the **first specific turn with a held counter**, the physical counter names, both Active Pokémon, candidate Active Energy and GX flag. Independently determine whether an Item action is legal on that turn, whether the correct Tool-removal target is present, whether counters were held intentionally, and whether the bot missed a winning tempo opportunity. Counter in hand is necessary for an unsearched play, but by itself never proves play legality, lock relief, attack conversion or game-winning success.

A separate [same-seed Ability action audit](new-moon-lockbreak-policy-exposure-gate.md) found no direct attacks, no Perfection activations and 176 recorded candidate passes across the eight arms. All eight source game first-turn slots matched the candidate's physical seat: the candidate went first every time. A seeded turn-order audit is planned to deliberately cover **candidate going second**, the intended Horror House opening.

**Do not claim the counter package failed strategically from these results.** It was never tried; the current benchmark tests an unqualified generic policy on a nonrepresentative turn-order slice.
