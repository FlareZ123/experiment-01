# Dedenne-GX and Crobat V Bench-entry Ability lock fidelity

**Agent 11, 16 October 2026.** Engine: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Evidence: [manual CI run 38868975484](https://github.com/FlareZ123/experiment-01/actions/runs/38868975484), [actual Store-action fixture](../../simulation/twinleaf/entry-draw-lock-action.cjs), [reversible compatibility guard](../../simulation/twinleaf/entry-draw-lock-hook.cjs).

## Mechanism

The pinned Store propagates `PlayPokemonEffect` to a Basic Pokémon card's handler before moving that Basic from hand to Bench. Both Dedenne-GX's *Dedechange* and Crobat V's *Dark Asset* check `IS_ABILITY_BLOCKED` during that preliminary propagation. Iron Thorns ex's active *Initialization* lock requires its target to be in play, and so misses the still-in-hand incoming Pokémon. The unmodified engine incorrectly offers these Abilities despite the lock. The reversible research-side hook briefly stages the incoming Basic on its chosen Bench destination for the existing lock test and then fully restores the original zones. The printed card reducer and vendor code remain unmodified.

## CI-proven results

The fixture uses actual `PlayCardAction` for the optional Canceling Cologne and for the incoming Pokémon, and resolves the actual Ability confirmation. A constructed playable midgame board has Active Iron Thorns ex, the opponent's Active Shadow Rider V, an empty Bench slot, six Prizes on each side and a deck with enough Basic Energy to draw.

| Pokémon Ability | Version | Cologne | Initialization | Drawn |
| --- | --- | --- | --- | ---: |
| Dedenne-GX Dedechange | Raw | No | Active | **6 (incorrect)** |
| Dedenne-GX Dedechange | Corrected | No | Active | **0** |
| Dedenne-GX Dedechange | Corrected | Yes | Suppressed | 6 |
| Crobat V Dark Asset | Raw | No | Active | **6 (incorrect)** |
| Crobat V Dark Asset | Corrected | No | Active | **0** |
| Crobat V Dark Asset | Corrected | Yes | Suppressed | 6 |

The remaining two raw-with-Cologne cases also drew six. All eight executions ended with the incoming Pokémon on Bench and zero unresolved prompts.

## Source field relevance

Counting [the 29 published Aichi Top 32 lists](../aichi-2026/full-decklists.json), Dedenne-GX appears **22 copies across 18 lists** and Crobat V appears **15 copies across 13 lists**. Their union covers **19 different published decks** (ranks 4, 5, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 20, 21, 22, 26, 27, 30, 32). These counts demonstrate potential exposure only, not actual trigger frequency.

Related: [Tapu Lele Wonder Tag entry defect](lele-entry-ability-lock-timing.md) and [Radiant Eternatus Gate entry defect](cologne-radiant-gate-store-action.md).

## Stadium-control refinement

[Manual CI 38869867640](https://github.com/FlareZ123/experiment-01/actions/runs/38869867640) also passed [the real Store Path/Silent Lab contrast](../../simulation/twinleaf/entry-draw-stadium-lock-action.cjs) on both Pokémon. Unmodified Twinleaf offered and resolved six-card entry draws through **Path to the Peak**, which removes the Abilities of Rule Box Pokémon **in play**; the new guard correctly prevented both draws. **Silent Lab** explicitly removes Abilities from Basic Pokémon *in play, in hand and in discard*. The unmodified engine already prevented both entry draws under Silent Lab; the guard preserved this behavior. Both raw and guarded engines drew six in the no-lock control. Different lock wordings must remain distinct during engine patching.

**Limits:** This is a synthetic board-state execution, not a full legal opening, decision-policy validation or win-rate estimate. Version correction flags and test complete source lists before competitive inference. Source rules: [Dedenne-GX](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx.ts), [Crobat V](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-darkness-ablaze/crobat-v.ts).
