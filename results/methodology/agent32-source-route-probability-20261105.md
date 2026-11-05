# Rank-6 Iron Thorns first-turn Thunder Mountain + DCE source screen

**Agent 32, 5 November 2026. Source-only physical opening model. Zero qualified games.**

The authenticated original sixth-place Kazuma Kashi Iron Thorns 60 in [full-decklists.json](../aichi-2026/full-decklists.json) contains 4 Iron Thorns ex, 2 Guzma & Hala, 2 Tag Call, 1 Thunder Mountain Prism Star and 1 Double Colorless Energy. Its original source manifest blob is `ae773f6201d7aa69d31914dbfee66f3fba692200`. [Printed Iron Thorns](https://limitlesstcg.com/cards/en/TWM/77) requires Lightning plus two Colorless for Volt Cyclone; Thunder Mountain can reduce the Lightning requirement and DCE supplies the remaining two Colorless.

The condition is a Basic-valid source starting seven, every optional opposing-mulligan compensation card drawn, plus one ordinary draw on the source's first turn going second. Both Thunder Mountain and DCE must avoid six Prizes. Either both are held directly, Guzma & Hala is held, or Tag Call is held with at least one unprized searchable Guzma & Hala. This measures resource access subject to a feasible two-card G&H physical payment. Strategic discard quality, search decisions and opponent effects remain unmodeled.

| Opponent fixed contender | Conditional source route exposure |
| --- | ---: |
| Seven-Basic ADP/Thorton/Regidrago v2 | **35.0617882%** |
| Fourteen-Basic rank-one Shadow Rider reference | **34.0461749%** |

The low-Basic candidate improves the **opponent's** source opening access by **1.0156133 percentage points**. The exact 30-bonus-tail intervals are [0.3506178820355765, 0.3506178820358028] and [0.3404617487812517, 0.3404617487812517]. Independently simulated full 60-card shuffles, 120,000 each, seed 3202606: 42,181 and 40,720 positive resource screens. Standard errors were around 0.138 and 0.137 percentage points. A real attack or game win is not asserted.

Reproduce with the [exact hypergeometric model](../../simulation/evaluation/agent32-rank6-thunder-dce-resource-gate.cjs), [six tests](../../tests/agent32-rank6-thunder-dce-resource-gate.test.cjs) and [seeded physical replay](../../simulation/evaluation/agent32-rank6-thunder-dce-physical-check.py). Original 29/32 sources remain authenticated; ranks 23,25,28 are missing and no competitive full game is qualified. Incorporation into a frozen owner-safe bilateral policy remains an [Issue 25](https://github.com/FlareZ123/experiment-01/issues/25) task.


## Disjoint route decomposition for integration

A second exact calculation partitions the same resource event by the **first indispensable search channel**. Where both Thunder Mountain and DCE are already held, classify it as direct even when search cards are also held; otherwise prefer an already held Guzma & Hala, then Tag Call to a searchable Guzma & Hala.

| Disjoint rank-six resource channel | Seven Basic contender | Fourteen Basic reference |
| --- | ---: | ---: |
| Both targets already held | 1.437149% | 1.308203% |
| Held Guzma & Hala searches missing target(s) | 18.954617% | 18.345298% |
| Held Tag Call reaches unprized Guzma & Hala | 14.670022% | 14.392674% |
| **Total** | **35.061788%** | **34.046175%** |

**95.90% of the seven-Basic opponent's screened source openings require an actual Supporter search path**; 41.84% of source openings that pass the resource screen require Tag Call as the initial connector. This is a prioritization diagnostic for the selected bilateral policy's legal owner-hand action selection, card payment and deck-search prompts. It does not imply that taking that line is strategically best, since other source lines compete for the turn's Supporter and any discard resources.

[Reproducible partition](../../simulation/evaluation/agent32-rank6-thunder-dce-route-partition.cjs) and [six pure tests](../../tests/agent32-rank6-path-partition.test.cjs). The tests independently enumerate a small Prize case and verify that three modes sum to the existing exact physical gate across multiple optional bonus counts.
