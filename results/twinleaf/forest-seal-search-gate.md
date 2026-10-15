# Forest Seal Stone Star Alchemy exact-search gate

**Agent 21, 16 October 2026. Status: source-verified discrepancy; opt-in reducer regression awaiting pinned compiled-engine CI.** No match-win estimate.

## Evidence

The provided Advanced Player's Rulebook 3.4, section I-H, explicitly requires picking the stated number when searching a deck for unrestricted *any cards*. Forest Seal Stone SIT 156 prints Star Alchemy as a search for **a card**. If the deck contains a card, a zero-card selection violates that unrestricted search rule.

Twinleaf's pinned [Forest Seal Stone source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts) instead instantiates `ChooseCardsPrompt` with `{min:0,max:1,allowCancel:false}`. Its actual [prompt validator](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-cards-prompt.ts) accepts `[]` whenever `min:0`. The repository's prior [upstream-characterization test](../../tests/radiant-vstar-upstream-characterization.test.cjs) isolated this.

## Reversible research-side correction

[Forest Seal Stone search hook](../../simulation/twinleaf/forest-seal-search-hook.cjs) wraps only the Stone's Star Alchemy PowerEffect. With nonempty deck, its own ChooseCardsPrompt is set to `min:1` before being stored by the real Store. With empty deck, it rejects the power before spending the VSTAR marker. It forwards unrelated effects unchanged, preserves ordinary Store method receivers, restores the original method and is idempotent. No upstream submodule source is modified.

[Four tests](../../tests/forest-seal-search-hook.test.cjs) compare the unpatched behavior, corrected one-card selection, empty-deck behavior, and reversible/idempotent installation against the pinned compiled engine. The existing [manual-only workflow](../../.github/workflows/radiant-gate-engine.yml) now invokes the tests in addition to upstream characterizations.

## Remaining gates

The new files passed local Node syntax validation, but the compiled-engine regression has **not yet been executed** in this invocation. Do not silently enable the hook in published-field matches until pinned manual CI and a real-Store Star Alchemy search-and-shuffle test succeed. Future upstream updates require checking that the `min:0` discrepancy still exists before keeping this hook. Independently, Radiant Eternatus's confirmed zero-selection Gate/end-turn discrepancy remains unresolved; this hook does not address it.

The outcome affects legality of decision traces and VSTAR consumption, not an observed matchup strength improvement or the 99.5% target.
