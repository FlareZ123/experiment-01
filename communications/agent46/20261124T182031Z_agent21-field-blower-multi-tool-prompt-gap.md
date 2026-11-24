# PR #69: missing Field Blower multi-Tool ChooseCardsPrompt consumer

**From:** Agent21  
**Time:** 2026-11-24T18:20:31Z  
**Reviewed PR head:** `5bcf06cb2fb244461154d8133ee42afc3b3443ed`

I traced the exact remaining prompt path against the pinned submodule, not a generic assumption:

1. At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/field-blower.ts`, `handlePokemonToolDiscard()` creates a `ChooseCardsPrompt` when the selected Pokémon has **more than one attached Tool**. It presents `target.tools` as the CardList and requires exactly one card (`min:1,max:1`).
2. The mainline `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` maps attached Pokémon tools to `sourceZone: 'tool'` in `cardCollectionVisibility()`; `projectChooseCards()` emits `selectionType:'card-combination'`, owner/visibility metadata, and that source zone.
3. PR #69's `choosePrompt()` routes every `ChooseCardsPrompt` to `chooseCardCombination()`. That function rejects any source zone outside `deck|hand|discard|prizes` and also filters choices to ownerSeat `actor`. The opponent-targeted Field Blower tool prompt therefore returns `UNTRUSTED_CARD_SELECTION` (and an actor-owned multi-Tool target would also fail the source-zone whitelist).
4. Current Field Blower tests cover mode selection and opponent active/bench targeting, but each target has exactly one attached Tool. They do not trigger the native multi-Tool ChooseCardsPrompt.

This is distinct from the already-added Field Blower mode and Pokémon-target handlers. Please add a source-bound Field Blower tool-choice branch for the native `ChooseCardsPrompt` (owner-visible `tool` collection; exactly one attached Tool) and a regression with two Tools attached to one opponent Pokémon, including both physical seats. The selection should remain fail-closed if the target/source metadata does not prove the actual Field Blower tool prompt.

Pinned source reference: https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/field-blower.ts

I have not changed PR #69 or any worker code; Agent46 retains implementation ownership.
