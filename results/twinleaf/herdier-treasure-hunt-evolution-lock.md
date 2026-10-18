# Herdier SUM 104 Treasure Hunt: illegal two-Item recovery and missed on-evolution Ability locks

**Agent 11, 18 October 2026 UTC.** Scope: source-class audit and seven actual staged `Store.dispatch(PlayCardAction)` evolutions, with an opt-in reversible research correction. This is a **paper-rules fidelity correction**, with **zero independently qualified competitive games**.

## Why this matters to the fixed Aichi benchmark

The [published Aichi 2026 printing-aware field](../aichi-2026/full-decklists.json) registers `Herdier SUM 104` in **rank 2** and **rank 15**. Both are part of the target 32-deck field. An incorrect on-evolution Item recovery can affect availability of future lock, search, mobility or counterplay resources. None of the observations below establishes how often those states occur in source-dealt full games.

Herdier's printed **Treasure Hunt** is optional on evolution from hand and permits retrieving **one Item** from the discard pile. Effects such as active **Wobbuffet PHF 36** Bide Barricade and **Tool-equipped Garbodor BKP 57** Garbotoxin suppress the relevant non-Psychic/non-exempt Pokémon Ability. The supplied Advanced Player's Rulebook §E-05 distinguishes Pokémon played from the hand to evolve and the immediate Ability trigger; §II-A gives current card text priority over default rules.

## Pinned source cause

Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Upstream implementation: `ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon/herdier.ts`.

The reducer intercepts `EvolveEffect` for Herdier, checks whether an Item is available in the evolving player's discard, and directly creates a `ChooseCardsPrompt` **without testing `IS_ABILITY_BLOCKED`**. Its selection options specify `{ min: 1, max: 2, allowCancel: true }`. The printed ability has no basis for choosing two. Both problems are localized to the reducer of this source printing; the same game may have other engine or bot-policy differences.

## Source-compiled experimental controls

Code: [actual evolving Store action](../../simulation/twinleaf/herdier-treasure-hunt-lock-action.cjs), [reversible correction](../../simulation/twinleaf/herdier-treasure-hunt-hook.cjs), [paired regression](../../simulation/twinleaf/herdier-treasure-hunt-hook-contract.cjs).

Actual board: opponent Active selected Wobbuffet / Iron Thorns / neither; optional opponent Benched Garbodor with or without a Pokémon Tool; Lillipup CEC on the player's Bench, Herdier SUM in hand, Switch SVI in discard. All cases have six occupied Prize slots, deck cards and a later-turn legal evolution action. The seventh scenario adds a second discarded Item, Ultra Ball SVI. The correction is **opt-in**, makes no vendor modification and restores the source `Herdier.prototype.reduceEffect` after the test.

| Board when Herdier evolves | Raw item count recovered | Corrected count | Paper expectation |
| --- | ---: | ---: | ---: |
| No lock | 1 | 1 | 1 |
| Opponent's active Wobbuffet | **1** | 0 | 0 |
| Tool-equipped Garbodor on opponent's Bench | **1** | 0 | 0 |
| Same Garbodor without Tool | 1 | 1 | 1 |
| Silent Lab Stadium | 1 | 1 | 1 (Stage 1) |
| Opponent's active Iron Thorns ex | 1 | 1 | 1 (non-Rule-Box) |
| No lock, two Items in discard | **2** | 1 | 1 |

The two-Item source control actually offered `max: 2`, accepted both selected Items, and moved both to hand. Under the correction its prompt has `max: 1`, rejects the two-Item proposal, and moves one. Under Wobbuffet or operative Garbotoxin it offers **no** recovery prompt. All seven corrected outcomes matched the printed expectations and the source reducer was restored and shown to revert to the original behavior.

Evidence: first source regression [manual compiled CI 39144922374](https://github.com/FlareZ123/experiment-01/actions/runs/39144922374), artifact `herdier-evolution-lock-matrix` 12143370945; paired seven-case correction [manual compiled CI 39145396892](https://github.com/FlareZ123/experiment-01/actions/runs/39145396892), artifact `herdier-corrected-contract` 12142942240. Both relevant **targeted test and artifact-upload steps** passed. The paired artifact SHA-256 is `9eed130e44411f838a90a4b4ad35b28d20c23dd2cf3faa77d1ae38b842fbf88e`. The correction is versioned `HerdierTreasureHuntPaper-v1` in the opt-in headless runner provenance; a separate bounded lifecycle test checks hook restoration.

## Limits and next evidence gate

- These are **injected midgame states**, with a genuine Store evolution and prompt selection, not naturally dealt 60-card games or independent adversarial policies. The first replay validates the source bug; neither raw nor corrected outcome is a competitive win or loss.
- The correction handles this printing's one-Item restriction and Ability-block check. It does not certify every on-evolution Pokémon Ability in the card pool, every applicable Ability-lock matchup, or correct strategic selection of the retrieved Item.
- Need a source-locked **natural Herdier evolution** encounter for ranks 2/15, with observed actual lock exposure and both policy choices, then a source-dealt decision-to-reply continuation under matched seeds. Record missed/negative exposure and all errors rather than classing a staged witness as a matchup.
- The target remains one fixed legal 60 across the full Aichi Top 32, with ranks **23, 25, 28** exact source lists still unpublished and **zero policy-qualified competitive games**. No 99.5% win-rate demonstration results from this study.
