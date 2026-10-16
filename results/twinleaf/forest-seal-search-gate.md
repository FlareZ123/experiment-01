# Forest Seal Stone Star Alchemy exact-search gate

**Agent 21, 16 October 2026. Status: source-verified discrepancy and compiled Store regression passed; hook remains opt-in.** No match-win estimate.

## Evidence

The provided Advanced Player's Rulebook 3.4, section I-H, explicitly requires picking the stated number when searching a deck for unrestricted *any cards*. Forest Seal Stone SIT 156 prints Star Alchemy as a search for **a card**. If the deck contains a card, a zero-card selection violates that unrestricted search rule.

Twinleaf's pinned [Forest Seal Stone source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts) instead instantiates `ChooseCardsPrompt` with `{min:0,max:1,allowCancel:false}`. Its actual [prompt validator](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-cards-prompt.ts) accepts `[]` whenever `min:0`. The repository's prior [upstream-characterization test](../../tests/radiant-vstar-upstream-characterization.test.cjs) isolated this.

## Reversible research-side correction

[Forest Seal Stone search hook](../../simulation/twinleaf/forest-seal-search-hook.cjs) wraps only the Stone's Star Alchemy PowerEffect. With nonempty deck, its own ChooseCardsPrompt is set to `min:1` before being stored by the real Store. The pinned Store's prompt reducer does not independently validate a submitted prompt result, so the hook also rejects an illegal zero-card answer at its callback boundary rather than allowing it to contaminate game evidence. With empty deck, it rejects the power before spending the VSTAR marker. It forwards unrelated effects unchanged, preserves ordinary Store method receivers, restores the original method and is idempotent. No upstream submodule source is modified.

[Five tests](../../tests/forest-seal-search-hook.test.cjs) compare the unpatched behavior, corrected one-card selection, empty-deck behavior, and reversible/idempotent installation against the pinned compiled engine. The existing [manual-only workflow](../../.github/workflows/radiant-gate-engine.yml) now invokes the tests in addition to upstream characterizations.

## Remaining gates

The first pinned compiled-engine regression (original four tests) passed [manual CI 38826864839](https://github.com/FlareZ123/experiment-01/actions/runs/38826864839). A subsequent fifth callback-guard test and two genuine Store dispatch-and-shuffle regressions passed [manual CI 38827232506](https://github.com/FlareZ123/experiment-01/actions/runs/38827232506). Pinned reducer and real-Store CI now pass. Do not silently enable the hook in published-field matches until a real headless matchup run and policy compatibility test succeed. Future upstream updates require checking that the `min:0` discrepancy still exists before keeping this hook. Independently, Radiant Eternatus's confirmed zero-selection Gate/end-turn discrepancy remains unresolved; this hook does not address it.

The outcome affects legality of decision traces and VSTAR consumption, not an observed matchup strength improvement or the 99.5% target.

## Published-field relevance

The source-verified [Aichi 2026 printing manifest](../aichi-2026/full-decklists.json) contains **13** Forest Seal Stone SIT 156 copies across **12 of the 29 published opposing decklists**, including the rank-1 champion. The exact affected ranks are **1, 3, 4, 5, 8, 9, 11, 16, 19, 22, 26, 30**; rank 11 plays two. [The pure, repeatable census](../../scripts/aichi-forest-seal-census.cjs) and its [printing-aware tests](../../tests/aichi-forest-seal-census.test.cjs) preserve this exposure count. The latter passed in [manual CI 38828139942](https://github.com/FlareZ123/experiment-01/actions/runs/38828139942). Card presence does not establish that any Stone was successfully attached or used, nor that the zero-choice bug was ever encountered in those matches.

## Opt-in headless runner contract

The [headless runner](../../simulation/twinleaf/headless.cjs), [field evaluator](../../simulation/evaluation/field-benchmark.cjs) and [Aichi pilot](../../simulation/evaluation/aichi-pilot.cjs) now accept the separate explicit option `forestSealSearchCorrection: true`. The flag is propagated to machine-readable results and installs the research hook only inside the match's exception-safe teardown scope. The default remains disabled for comparability with earlier unpatched runs. A [seeded combined opt-in smoke](../../simulation/twinleaf/forest-seal-opt-in-smoke.cjs) checks strict prompt validation and confirms the pinned Stone reducer is restored after the match; this extension awaits its own manual compiled CI before use in statistical research.
