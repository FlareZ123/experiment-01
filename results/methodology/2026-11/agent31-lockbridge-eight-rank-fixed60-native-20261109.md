# Lockbridge Shadow Rider versus champion: eight original Aichi ranks

**Agent 31 | 9 November 2026 | real Store comparison, 32 native game attempts.**

## Decision

**Do not promote the fixed Lockbridge 60.** The unchanged published rank-1 Shadow Rider champion finished with five native wins, four losses and seven action caps. The Lockbridge candidate achieved three native wins, four losses and nine action caps. There were no engine errors. In the six physically paired games that finished naturally on both sides, one changed winner in favor of the champion and zero in favor of Lockbridge. This is a small, heavily censored developmental study. No qualified paper game or 99.5% win-rate evidence exists.

## Deck hypothesis

Lockbridge v1 takes the complete prior Hood Shield v1 list and makes four count changes: remove one Lillie's Clefairy ex and one Pokémon Ranger; add Wobbuffet PHF 36 and Temple of Sinnoh ASR 155. It preserves four Shadow Rider Calyrex V, four Shadow Rider VMAX, two Stealthy Hood, one Arven and eleven Basic Psychic Energy. The locked printed list contains 18 Pokémon, 31 Trainers and 11 Energy. Its goal was to combine the active-Basic Ability-suppression axis, Bench Ability protection and Special Energy denial into one fixed deck. Its exact printings are English-display research IDs, and Japanese Extra paper legality remains provisional.

Candidate: [Lockbridge v1 complete printing-aware 60](../../aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json). Baselines: [champion reference](../../aichi-2026/benchmark-shadow-rider.md) and [Hood Shield v1](../../aichi-2026/candidate-hood-shadow-rider.md).

## Experimental design and custody

The [registration](../../aichi-2026/registrations/2026-11/agent31-lockbridge-panel-frozen-20261109.json) was committed **before the first native game** (commit `b47e65f2ef7e77a190604dd8f1d25e0a215f95b2`). Sixteen distinct 32-bit random seeds were assigned to original source ranks 1, 2, 5, 6, 11, 13, 17 and 24, two candidate physical seats per rank. Each seed was used for the champion and Lockbridge, creating 32 real native attempts under the same two-player policy. Printed contender sixties remained fixed. The actual original source physical opening fingerprint and actual starter seat were both equal across contenders in **16/16** groups. A matching seed alone was never treated as a matched physical opening.

Runner: [source](../../../simulation/evaluation/agent31/lockbridge-champion-eight-rank-panel.cjs). It uses the existing frozen Agent41 bilateral development actor, paired per-seat randomness isolation, the Agent19 three-component paper-semantics profile, Underworld Door owner-recipient correction, and identical all-owner portable Float Stone plus VS Seeker/Guzma decisions for both contenders. Twinleaf submodule pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Root-action limit: 260 per native game. Every original source contender and bot choice is native to the pinned Store.

[Successful original native CI #42579461346](https://github.com/FlareZ123/experiment-01/actions/runs/42579461346), head `8b60d428246bc18ce5018349a42d78570923ea37`. All four preregistration/comparison/printed-list regressions passed. Raw six-figure action and prompt histories, physical fingerprints, error/status fields and input manifests are retained in artifact [#13656852047](https://github.com/FlareZ123/experiment-01/actions/runs/42579461346/artifacts/13656852047). ZIP SHA256 `fa29e3c1c96c1b089287dd89631801aa5c7e14a61641b8812bf8935d27640155`.

## Native outputs

| Measure | Champion rank-1 60 | Lockbridge v1 60 |
| --- | ---: | ---: |
| Native attempts | 16 | 16 |
| Native wins | 5 | 3 |
| Native losses | 4 | 4 |
| Naturally terminal native games | 9 | 7 |
| Root-action-cap censored games | 7 | 9 |
| Native engine errors | 0 | 0 |

Of all sixteen original source opening/seat matched pairs, **six** finished naturally in both contender arms. **One** winner reversed in the champion's favor; **zero** in Lockbridge's favor. Any unpaired win at a given rank cannot by itself be interpreted as a paired superiority result.

| Original source rank | Original archetype | Champion native wins / 2 | Lockbridge native wins / 2 | Both naturally terminal |
| ---: | --- | ---: | ---: | ---: |
| 1 | Shadow Rider mirror | 1 | 0 | 1 |
| 2 | Vileplume Control | 0 | 0 | 0 |
| 5 | Mew Genesect | 2 | 1 | 1 |
| 6 | Iron Thorns | 0 | 0 | 1 |
| 11 | Absol/Garbodor | 1 | 0 | 0 |
| 13 | Regidrago | 1 | 2 | 1 |
| 17 | Raichu/Electrode Combo | 0 | 0 | 0 |
| 24 | Iron Thorns | 0 | 0 | 2 |

The Lockbridge rank13 second native win occurred when not both paired arms finished; it is not a verified matchup improvement. The sample yielded **no native success against either tested Iron Thorns rank** and no clear evidence that the combined lock tools overcame item or Ability lock. The direct removal of a Clefairy and Ranger comes with opportunity costs. Observed native outcomes cannot identify which substitution was responsible.

## Consequence

Prior 116-game all-29 original-field work identified Hood Shield v1 as a more promising modified architecture than the other tested challenger lists, with six Hood-favorable versus three champion-favorable paired terminal reversals but severe simulator qualification limits. Lockbridge's only new structural differences from Hood Shield are Wobbuffet and Temple in exchange for Clefairy and Ranger. The current 32-game native results provide no case for preferring this unqualified hybrid. Retain this experiment as a negative result and redirect effort toward **actionable owner-paid lock counterplay**, especially actual Arven -> Stealthy Hood setup decisions and source-owned opponent responses, before further hybrid deck composition changes.

The 99.5% field target remains unsubstantiated; original Top32 ranks 23, 25 and 28 lack complete authenticated original 60s. Missing paper-rule and opponent-policy qualification prevents real competitive win-rate inference.
