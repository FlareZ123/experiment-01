# Aichi champion: Lillie's Clefairy ex Fairy Zone doubles nested Copycat damage

**Agent 1, 16 October 2026.** Pinned engine `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, reproducible [manual CI 38848636467](https://github.com/FlareZ123/experiment-01/actions/runs/38848636467), **passed**.

## Line and rules

The published [rank-1 Shadow Rider Calyrex list](benchmark-shadow-rider.md) includes 1 Mimikyu GRI 58, 1 Dialga-GX UPR 100, and 2 Lillie's Clefairy ex JTG 56. In the specific Regidrago counter-line, Mimikyu can use Copycat to select the opponent's preceding non-GX Apex Dragon attack, then select Timeless-GX from the player's own discarded Dialga-GX.

The pinned Clefairy ex source (`ptcg-server/src/sets/10-scarlet-and-violet/set-journey-together/lillies-clefairy-ex.ts`) implements Fairy Zone by changing the Weakness of opponent's Dragon Pokémon to Psychic when the Clefairy Ability is active. It sets the relevant `CheckPokemonStatsEffect.weakness` to Psychic. The supplied Advanced Player's Rulebook 3.4 I-A-01 applies Weakness during normal damage calculation.

For Mimikyu, a Psychic-type attacker, a 150-damage copied Timeless-GX should therefore become 300 against a Dragon-type defender under Fairy Zone.

## Staged pinned-engine test

The [declared-action fixture](../../simulation/twinleaf/mimikyu-apex-action-test.cjs) creates a real Mimikyu GRI Active with two attached Psychic Energy cards, opponent Active Regidrago VSTAR, prior opponent Apex Dragon attack record, own discarded Dialga-GX, and six occupied Prizes per player. The test uses opt-in copy-tag compatibility and declared-history correction hooks, dispatches `AttackAction('Copycat')`, chooses Dialga's Timeless-GX through the engine's actual `ChooseAttackPrompt`, and inspects the defender's accumulated damage.

It contrasts the same staged board with and without one Lillie's Clefairy ex on the attacking player's Bench. **The Fairy Zone variant artificially raises the defender's fixture HP from printed 280 to 400** solely so 300 damage remains observable rather than being cleared during Knock Out resolution.

| Property | No Fairy Zone | Fairy Zone active |
| --- | ---: | ---: |
| Timeless-GX copied damage against Regidrago | 150 | **300** |
| Mimikyu's persisted declared attack | Copycat | Copycat |
| `usedGX` consumed | true | true |
| Extra turn armed | true | true |
| Synthetic target HP | 280 | 400 |

[Manual CI 38848636467](https://github.com/FlareZ123/experiment-01/actions/runs/38848636467) passed these assertions. The printed Regidrago VSTAR has 280 HP, so a legal 300-damage hit is enough to Knock It Out, absent other protection or modification. The actual printed-HP Knock Out, Prize collection, and subsequent extra turn are not yet demonstrated by this fixture.

## Limits

The board is staged, an earlier Apex Dragon attack record is injected, and legal development of both Pokémon and Energy is outside scope. The hooks are research-only and disabled by default. The sample tests Fairy Zone with a working Ability and does not exercise Ability lock, Tool lock, GX reuse, any opponent decision policy, or the whole Aichi Top 32. It is a mechanistic interaction validation and supplies no matchup win-rate estimate.

## Later native source-game correction — 13 November 2026

The limitation above remains accurate for the original 16 October *synthetic-400-HP fixture*, but the later source-game evidence now supplies the missing printed-HP KO and Prize observation. The successful native source run [42736249858](https://github.com/FlareZ123/experiment-01/actions/runs/42736249858), archived artifact **13727930325**, has a pre-Copycat board snapshot showing Lillie's Clefairy ex on the Shadow Rider player's Bench. In that same historical source game, Mimikyu's real Copycat choice selects the owner's Dialga-GX UPR / Timeless-GX; the 280-HP Regidrago VSTAR is removed from Active and the owner collects two Prize cards.

The apparent 150-versus-280 discrepancy was an observer omission, not a damage-engine defect: the observer recorded Regidrago's printed Weakness array (empty) but did not include the live Ability-modified Weakness. Fairy Zone changes each opposing Dragon Pokémon's Weakness to Psychic ×2. Mimikyu is Psychic, so copied Timeless-GX's 150 base damage becomes **300**, which Knocks Out the 280-HP Regidrago VSTAR. This is consistent with the printed card text and the native Store transition.

The separate [extra-turn progression report](../twinleaf/mimikyu-extra-turn-progression.md) records the successful real WaitPrompt transition from turn 5 to turn 6 with the same Mimikyu player active after copied Timeless-GX. Together, these artifacts establish the staged copied-attack mechanics, the historical native printed-HP two-Prize KO under Fairy Zone, and the extra-turn transition. They do **not** establish natural frequency, a full-game win-rate improvement, or any qualified Aichi matchup result. The remaining research problem is the low joint incidence of Mimikyu + two Psychic Energy + Dialga in discard + an opponent Apex Dragon response window, followed by credible full-game policy evaluation.
