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
