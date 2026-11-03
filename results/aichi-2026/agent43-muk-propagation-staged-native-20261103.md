# Agent43 pinned Muk suppression of original rank26 Exeggcute Propagation

**3 November 2026. Eight real Store dispatches across both physical seats passed; deliberately staged card zones; zero competitive games.**

The authentic paper rank26 includes Exeggcute PLF4 with discard-pile **Propagation**. Alolan Muk SUM58 **Power of Alchemy** removes Basic Pokémon Abilities in play, hand and either discard. Pinned Twinleaf engine commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` was compiled and the native Store exercised through an actual `UseAbilityAction` on Exeggcute in discard. Each arm read `CheckPokemonPowersEffect`, `IS_ABILITY_BLOCKED`, and the live post-dispatch owner zones, resolving rollback-corrected state.

| Muk position | Seat 0 and seat 1 power discovery | Native action | Egg custody after |
| --- | --- | --- | --- |
| Absent | Propagation available | Accepted | Hand |
| Opponent Bench | Propagation unavailable | Rejected `UNKNOWN_POWER` | Discard |
| Source owner's Bench | Propagation unavailable | Rejected `UNKNOWN_POWER` | Discard |
| Opponent discard pile | Propagation available | Accepted | Hand |

The **eight new native cases passed** on both seats with no unresolved prompts. The existing paid Boost Shake / Iron Thorns case also passed, yielding **9/9 tests, zero failures** in that specific test script. Exact successful [manual CI run 41681085169](https://github.com/FlareZ123/experiment-01/actions/runs/41681085169), head `d0645e79fbca1bbc889fab207fef3b593f547fec`, on research branch `agent43-muk-discard-propagation-native-20261103`. The complete native code and test receipts are in [draft PR #22](https://github.com/FlareZ123/experiment-01/pull/22); this report does not imply the PR has been merged.

**Limits:** artificially staged source and opposing boards, energy filler and Prize slots, with no natural full-sixty deal, no actual Boost Shake in these eight arms, no original rank26 ability timing under opponent counterplay, no accepted source policies and no attack/Prize finish. Pinned Store matches the **specific tested suppression and ownership semantics**; it has not been certified generally paper-correct. The original rank26 may use its source-printed Canceling Cologne ASR136 on Active Muk; Escape Rope BST125 may force a sole Benched Muk Active, while Counter Catcher PAR160 may gust a Benched Muk after source Prize deficit. These are conditional tactical responses rather than measured frequencies.

**Decision:** A live Bench Muk can suppress the key rank26 Exeggcute loop, as independently established by card text, official Japanese cross-zone Ability Q&A and this real native Store dispatch. No one can award an Apex Alchemy win from this fact. Field remains 29/32 authenticated original sixties and zero qualified full games.