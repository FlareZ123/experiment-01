# First-player first-turn printed attacks: missing owner-root action family

**Agent 37, 30 October 2026. Evidence category: card/engine inspection, pure projection tests, native staged Store dispatch.** This report identifies and repairs an actor decision-vocabulary gap. It does not certify a 60-card candidate, paper legality of all variants, or any competitive game/matchup win rate.

## Root cause and bounded correction

The common `simulation/twinleaf/agent34-actor-only-root-policy.cjs` previously excluded all printed attacks whenever `view.globalTurn===1`. This blanket rule is mechanically too strong: the pinned upstream Twinleaf attack reducer at `vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/game-effect.ts`, around the first-player gating condition, permits the specifically marked `attack.canUseOnFirstTurn===true` attack despite general `state.rules.attackFirstTurn===false`. Genuine first-player printed exceptions therefore formed an unreachable action family under the common root.

The correction is **default-off** (`printedFirstTurnAttackRoot:true` or `AGENT37_FIRSTTURN_ATTACK_ROOT_DEV=true`). A pure predicate in [`agent37-firstturn-exception.cjs`](../../simulation/twinleaf/agent37-firstturn-exception.cjs) requires two independent facts: the public printed attack text explicitly says the attack can be used on the first turn when going first, and the exact pinned native attack object also has `canUseOnFirstTurn:true`. The [`actorObservation` adapter](../../simulation/twinleaf/actor-observation-contract.cjs) now exposes a public `canUseOnFirstTurn:true` property only for positive printings. For other attacks it preserves the existing observation keys. The [existing canonical root chooser](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) may then consider only these supported exceptions on global turn 1, preserving all ordinary Energy-cost and public attack-block checks. Actual legality and effect resolution remain with the live Store.

## Complete supplied English snapshot search

A reproducible search through the supplied `card-list.zip` English `cards/en/*.json` snapshot, selecting Pokémon attacks with the phrase `If you go first, you can use this attack on/during your first turn`, found **21 matching records from 12 distinct named Pokémon/attacks**:

| Printed name | Attack | English printing IDs | Printed category |
| --- | --- | --- | --- |
| Delibird | Quick Gift | me1-105; me1-152 | one-card deck search |
| Tapu Koko | Fast Flight | me2pt5-67 | hand discard, draw five |
| Pheromosa-GX | Fast Raid | sm5-140; sm5-158; smp-SM66 | 30 printed damage |
| Sableye | Quick Hunt | sm8-96 | one-card deck search |
| Bombirdier ex | Fast Carrier | sv4-156; sv4-234 | Basic Pokémon Bench search |
| Volbeat | Quick Sign | sv6-9 | Basic Pokémon Bench search |
| Exeggcute | Precocious Evolution | sv8-1; sv8-192 | self-evolution search |
| Indeedee | Smart Service | swsh12-86 | one-card deck search |
| Talonflame V | Fast Flight | swsh4-29; swsh4-168 | hand discard, draw six |
| Raichu V | Fast Charge | swsh9-45; swsh9-158 | Lightning Energy acceleration |
| Deoxys | Close Encounter | xy6-33 | draw two |
| Latios-EX | Fast Raid | xy6-58; xy6-101; xyp-XY72 | 40 printed damage |

This is a **dated database inventory**, not a Japanese card-availability or banlist certificate for the 10 May 2026 Aichi competition. Some later English printings could be out of the event's cutoff; mechanically equivalent and regionally legal printings must be verified separately. Nor does the presence of a searchable printed attack guarantee its native handler implements the effect correctly.

## Reproduction, limits and negative controls

- Pure [test suite](../../tests/agent37-firstturn-exception.test.cjs) verifies flag/text mismatch veto, standard first-player attack blocking when opt-in is off, ordinary payable non-exception attacks on later turns, mandatory Energy cost, Asleep/Paralyzed blocks, and private-zone noninterference through `actorObservation`.
- Earlier [read-only owner-observation→root arbitration suite](../../tests/agent37-owner-arbiter-observation-boundary.test.cjs) additionally provides a five-case two-physical-seat private-zone invariant and resource-hold gate. [Manual CI 41002237464](https://github.com/FlareZ123/experiment-01/actions/runs/41002237464) and [41002703626](https://github.com/FlareZ123/experiment-01/actions/runs/41002703626) **passed**, including the later both-seat case.
- The pinned native [`agent37-firstturn-exception.native.test.cjs`](../../tests/agent37-firstturn-exception.native.test.cjs) constructs a genuine two-player Store with public first-player rules prohibiting ordinary first attacks. It selects the existing first-turn Basic Energy attachment through the shared policy, dispatches an actual `PlayCardAction` onto its own Active, reevaluates the second owner root, selects the supported exception, dispatches the genuine `AttackAction`, and resolves native prompts. Both real physical seats and two distinct attack families are covered: Talonflame V VIV's Fast Flight draws six; Latios-EX ROS's Fast Raid deals 40 damage. The earlier preattached-Energy two-seat Talonflame native positive was compiled [CI 41003495544](https://github.com/FlareZ123/experiment-01/actions/runs/41003495544); the expanded 2-printing, 2-seat Energy-then-attack suite compiled and **passed** [CI 41003922441](https://github.com/FlareZ123/experiment-01/actions/runs/41003922441). Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The latter workflow ran at commit `4985bd56882f78154d1cb5f3ebdbc486796725a9`.
- These are **staged single-turn test boards**, not legal shuffled full 60-card openings, and no qualified opponent action-policy decisions were evaluated. A Store-accepted attack still requires field-specific continuation, Prize/terminal fidelity and actual match duration evidence before any deck-strength estimate.

## Unresolved strategic test

Many printed exceptions are utility attacks requiring choosing deck search targets, drawing into useful cards, or switching afterward. A root policy that can declare the first attack but delegates its generated attack-phase prompts to a weak native fallback is still incomplete. A credible next test should demonstrate that both physical actors make owner-authenticated, native-accepted choices during the attack resolution, preserve hidden-state isolation, then follow through under real opposing pressure. **Do not score a proposed one-card search as a successfully executed line.**

**Top 32 objective unchanged:** 29/32 exact source 60s (missing ranks 23, 25, 28), 0 competitively qualified games, no validated fixed 60 and no evidence of 99.5% game win rate.
