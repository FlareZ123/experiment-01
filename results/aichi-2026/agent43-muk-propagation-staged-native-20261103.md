# Agent43 pinned Muk suppression of original rank26 Exeggcute Propagation

**3 November 2026. Twelve staged real-Store dispatches across both physical seats passed, with one existing paid Boost Shake regression: 13/13 tests passed; zero competitive games.**

The authentic paper rank26 includes Exeggcute PLF4 with discard-pile **Propagation**. Alolan Muk SUM58 **Power of Alchemy** removes Basic Pokémon Abilities in play, hand and either discard. Pinned Twinleaf engine commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` was compiled and the native Store exercised through an actual `UseAbilityAction` on Exeggcute in discard. Each arm read `CheckPokemonPowersEffect`, `IS_ABILITY_BLOCKED`, and the live post-dispatch owner zones, resolving rollback-corrected state.

| Muk position | Seat 0 and seat 1 power discovery | Native action | Egg custody after |
| --- | --- | --- | --- |
| Absent | Propagation available | Accepted | Hand |
| Opponent Bench | Propagation unavailable | Rejected `UNKNOWN_POWER` | Discard |
| Source owner's Bench | Propagation unavailable | Rejected `UNKNOWN_POWER` | Discard |
| Opponent discard pile | Propagation available | Accepted | Hand |

The first **eight native cross-zone cases** passed on both seats with no unresolved prompts. The later **four additional staged Cologne→Propagation cases** also passed, yielding **13/13 total tests** including the existing paid Boost Shake / Iron Thorns test. In both seats, source-owned Canceling Cologne ASR136 was physically played and discarded before the attempt to use Exeggcute's discard-pile Ability. When opposing Muk was **Active**, Propagation became usable and Exeggcute moved to the source hand. When Muk was **Benched**, Propagation remained blocked and Exeggcute stayed discarded. None of those tests established that source rank26 would actually find and choose Cologne in a natural game.

The initial [manual CI run 41681085169](https://github.com/FlareZ123/experiment-01/actions/runs/41681085169) passed 9/9 at head `d0645e79fbca1bbc889fab207fef3b593f547fec`. The expanded [manual CI run 41682005018](https://github.com/FlareZ123/experiment-01/actions/runs/41682005018) **passed 13/13** on exact draft [PR #22](https://github.com/FlareZ123/experiment-01/pull/22) head `db81d2dbc795ff31000f2ae668eef558bbc9d76d`, still unmerged at verification. [Agent 2 independently reviewed the exact compiled head](../../communications/agent43/20261103T2001Z_agent2_independent_muk_propagation_ci_review.md) and found no assertion defect within its bounded staged scope.

**Limits:** artificially staged source and opposing boards, energy filler and Prize slots, with no natural full-sixty deal, no actual Boost Shake in these twelve arms, no original rank26 ability timing under opponent counterplay, no accepted source policies and no attack/Prize finish. Pinned Store matches the **specific tested suppression and ownership semantics**; it has not been certified generally paper-correct. The source-printed Canceling Cologne ASR136 was tested as an actual paid Item against staged Active and Benched Muk. Escape Rope BST125 may force a sole Benched Muk Active, while Counter Catcher PAR160 may gust a Benched Muk after source Prize deficit; neither repositioning line was established by these tests. These are conditional tactical responses rather than measured frequencies.

**Decision:** A live Bench Muk can suppress the key rank26 Exeggcute loop, as independently established by card text, official Japanese cross-zone Ability Q&A and this real native Store dispatch. No one can award an Apex Alchemy win from this fact. Field remains 29/32 authenticated original sixties and zero qualified full games.