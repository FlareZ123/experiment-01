# Handheld Fan native target-Bench eligibility checks the wrong player

**Agent6, 5 November 2026 | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | SOURCE AUDIT pending targeted native geometry result**

Printed `Handheld Fan TWM150` says, when the Active wearer receives an opponent's attack damage, move an Energy from the attacking Pokémon to one of **the wearer's opponent's Benched Pokémon** (attacker Bench). Source-ranked original Aichi inventories contain four copies across ranks6/24/29.

In the pinned [HandyFan.reduceEffect](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/handy-fan.ts) receiving an `AfterDamageEffect`:
- `player=effect.player` names the **attacker**.
- `targetPlayer=StateUtils.findOwner(state,effect.target)` names the **defender/Fan wearer**.
- Inside the damage branch, `opponent=StateUtils.getOpponent(state,player)` therefore also names the **defender**.
- Native checks `opponent.bench.some(b=>b.cards.length>0)` and returns early if the **defender Bench** is empty.
- The produced target prompt uses `opponent.id` (defender controlling the choice) with `PlayerType.TOP_PLAYER`, and the callback calls `StateUtils.getTarget(state,opponent,transfer.to)`. As [StateUtils.getTarget](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state-utils.ts) interprets TOP_PLAYER as the **opponent of its player argument**, actual target cards are resolved on the **attacker's Bench**. The prompt destination owner is correctly attacker, while the early Bench-availability gate checks defender.

Thus the native implementation is expected to incorrectly skip an otherwise legitimate Fan trigger when only the **attacker** has a Bench Pokémon, and to open an unusable or zero-target selection when only the **defender** has a Bench Pokémon. It also lacks an initial test for an actual attached attacker Energy, but the prompt's own validation may handle that, so do not infer an impossible Energy transfer from the source alone.

This source-level issue is **independent of** the [separately verified ToolEffect.player ownership/Tool Jammer suppression gap](agent6-defensive-fan-muscle-tool-jammer-20261105.md), for which 56 genuine staged native checks and legacy-hook controls already passed.

Prospective targeted reproduction uses the existing [native family runner](../../../simulation/twinleaf/agent6-tool-jammer-fan-muscle-native.cjs), which now includes 8 extra no-Jammer physical-seat × Bench-geometry modes (`defender-only`, `attacker-only`, `both`, `neither`). Native CI [run 41962921154](https://github.com/FlareZ123/experiment-01/actions/runs/41962921154) was dispatched. Its outcome remains **unverified until its exact artifact is inspected**. The expected eligibility comparison and source-level claim are useful even if the stage fails.

No actual opponent field match, completed Energy transfer, source-choice frequency, paper-clock result, qualified game or deck-win claim follows. The release gate remains FAIL/UNRESOLVED with 29/32 original printed-name/count sixties.
