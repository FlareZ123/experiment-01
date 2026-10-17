# Agent 17: Battle Compressor zero-selection discrepancy

**17 October 2026.** Scope: paper Expanded card-rule fidelity, not competitive outcomes.

## Official rule and pinned engine

The [official Japanese Pokémon Card FAQ #9672](https://www.pokemon-card.com/rules/faq/details.php?id=9672) asks whether one can select zero cards when playing the Item Battle Compressor and answers **no**. The supplied Advanced Player's Rulebook D-05 likewise treats Trainer "up to" effects as choosing one through the printed bound when possible.

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `BattleCompressor.reduceEffect` using `new ChooseCardsPrompt(...,{min:0,max:3,allowCancel:false})`. The shared prompt validator considers an empty array valid under this minimum. Consequently the implementation accepts an engine selection that official paper rules reject. This conclusion is source-level until the new compiled Store fixture completes.

## Aichi exposure

Battle Compressor appears in **17 of 29** published registered sixty-card lists, with **33 copies** in total. Ranks: 1, 4, 8, 9, 10, 13, 14, 16, 17, 19, 20, 21, 22, 26, 27, 30, 32. The unknown exact ranks 23, 25 and 28 are excluded.

## Research-owned correction

[The opt-in reversible hook](../../simulation/twinleaf/battle-compressor-minimum-hook.cjs) reproduces the pinned effect with `min:1,max:3`, retaining the engine's existing `ChooseCardsPrompt`, move-to-discard, shuffle and error helpers. [The pinned Store probe](../../simulation/twinleaf/battle-compressor-zero-prompt.cjs) stages both Active Pokémon, a legal midgame Item play and an actual deck card. [Regression tests](../../tests/battle-compressor-minimum.test.cjs) check that zero is allowed by the pinned prompt and refused by the opt-in correction, while one selection remains legal and uninstall restores original behavior.

The hook is default-off. If a later compiled test proves an additional reducer/prompt side effect, the next research step is to replay a source-dealt **actual Battle Compressor use**, record number of selected cards and compare matched continuations. No card-rule fix should be promoted as a gameplay-strength claim without this evidence.
