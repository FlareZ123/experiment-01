# Agent 17: Battle Compressor zero-selection discrepancy

**17 October 2026.** Scope: paper Expanded card-rule fidelity, not competitive outcomes.

## Official rule and pinned engine

The [official Japanese Pokémon Card FAQ #9672](https://www.pokemon-card.com/rules/faq/details.php?id=9672) asks whether one can select zero cards when playing the Item Battle Compressor and answers **no**. The supplied Advanced Player's Rulebook D-05 likewise treats Trainer "up to" effects as choosing one through the printed bound when possible.

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `BattleCompressor.reduceEffect` using `new ChooseCardsPrompt(...,{min:0,max:3,allowCancel:false})`. The shared prompt validator considers an empty array valid under this minimum. Consequently the implementation accepts an engine selection that official paper rules reject. A compiled pinned-Store fixture then confirmed the issue: [manual CI 38997358552](https://github.com/FlareZ123/experiment-01/actions/runs/38997358552) passed on `0e87c8ddad9dca4d4ff7738908041125c50295c7`, printing `min:0`, `max:3`, `acceptsZero:true`, `acceptsOne:true` for a real Item-play prompt with two deck cards. That records the **actual reachable prompt contract**, while direct empty-action resolution is tested separately.

## Aichi exposure

Battle Compressor appears in **17 of 29** published registered sixty-card lists, with **33 copies** in total. Ranks: 1, 4, 8, 9, 10, 13, 14, 16, 17, 19, 20, 21, 22, 26, 27, 30, 32. The unknown exact ranks 23, 25 and 28 are excluded.

## Research-owned correction

[The opt-in reversible hook](../../simulation/twinleaf/battle-compressor-minimum-hook.cjs) reproduces the pinned effect with `min:1,max:3`, retaining the engine's existing `ChooseCardsPrompt`, move-to-discard, shuffle and error helpers. [The pinned Store probe](../../simulation/twinleaf/battle-compressor-zero-prompt.cjs) stages both Active Pokémon, a legal midgame Item play and an actual deck card. [Regression tests](../../tests/battle-compressor-minimum.test.cjs) check that zero is allowed by the pinned prompt and refused by the opt-in correction, while one selection remains legal and uninstall restores original behavior.

The hook is default-off. If a later compiled test proves an additional reducer/prompt side effect, the next research step is to replay a source-dealt **actual Battle Compressor use**, record number of selected cards and compare matched continuations. No card-rule fix should be promoted as a gameplay-strength claim without this evidence.

## 17 October 2026: complete post-selection lifecycle verified

A later compiled test [39013281466](https://github.com/FlareZ123/experiment-01/actions/runs/39013281466) failed on a premature claim that Battle Compressor was already in the discard pile immediately after the empty-card selection. A separate Agent 11 shuffle-only attempt [39015647825](https://github.com/FlareZ123/experiment-01/actions/runs/39015647825) still failed. Reviewing the **pinned** `play-trainer-effect.ts` and `prefabs.ts` established the actual deferred cleanup chain: `finalizeTrainerCleanup` calls `waitPrompt` while prompts remain; `SHUFFLE_DECK` generates a `ShuffleDeckPrompt`, whose resolution generates a second animation `WaitPrompt`. The Item remains in the supporter/play zone until both are resolved.

The [updated Store probe](../../simulation/twinleaf/battle-compressor-zero-prompt.cjs) now optionally resolves the deck shuffle using a valid full index permutation and the ensuing animation WaitPrompt. The [regression](../../tests/battle-compressor-minimum.test.cjs) asserts the intermediate zone and unresolved shuffle, the final Item discard and empty pending prompts, the research hook's refusal of zero, and successful one-card discard under the corrected prompt. **Manual compiled CI [39033164385](https://github.com/FlareZ123/experiment-01/actions/runs/39033164385) succeeded**, at immutable head `58af7338bddd1e020a91c6ec327b2cfac9c64688`, including the entire existing exact-printing feasibility workflow. No per-commit CI was added.

This fixes a false assertion in the fixture, **without erasing the real pinned `min:0` paper-rule discrepancy**. A synthetic Store setup, even with complete prompt cleanup, does not prove source-dealt Aichi exposure, general card-rule fidelity, bot competence or any competitive win. Qualified competitive games remain zero.
