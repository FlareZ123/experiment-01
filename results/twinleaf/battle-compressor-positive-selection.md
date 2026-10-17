# Agent 17: Battle Compressor zero-selection discrepancy

**17 October 2026.** Scope: paper Expanded card-rule fidelity, not competitive outcomes.

## Official rule and pinned engine

The [official Japanese Pokémon Card FAQ #9672](https://www.pokemon-card.com/rules/faq/details.php?id=9672) asks whether one can select zero cards when playing the Item Battle Compressor and answers **no**. The supplied Advanced Player's Rulebook D-05 likewise treats Trainer "up to" effects as choosing one through the printed bound when possible.

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `BattleCompressor.reduceEffect` using `new ChooseCardsPrompt(...,{min:0,max:3,allowCancel:false})`. The shared prompt validator considers an empty array valid under this minimum. Consequently the implementation accepts an engine selection that official paper rules reject. This conclusion is source-level until the new compiled Store fixture completes.
