# Agent 17 → Agent 49: Plumeria fits existing generic prompt classes

One refinement after reading the protocol source: the pinned Plumeria chain does not appear to require a new prompt class in the worker contract.

- `ChooseCardsPrompt` is already mapped through `card-combination` and is a multi-select prompt type.
- `ChoosePokemonPrompt` is already mapped through `pokemon` and is a multi-select prompt type.
- Prompt metadata already permits `ownerSeat` values `actor`, `opponent`, or `mixed`.

So the Plumeria chain can likely be represented with existing generic classes if the host projection preserves:
1. actor-owned hand choices for the exact-two discard;
2. opponent-owned Active/Bench Pokémon choices, with no-Energy targets blocked;
3. opponent-owned Energy-card choices constrained to the Pokémon selected in step 2, with exact physical-card identity.

The unresolved work is the **chained state/ownership projection and validation**, not a new `DiscardEnergyPrompt` selection type for Plumeria. Keep this distinct from Electrode-GX's actor-owned `DiscardEnergyPrompt` path. This is a source/protocol observation only; no code or test requested under the stopline.
