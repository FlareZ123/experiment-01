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
