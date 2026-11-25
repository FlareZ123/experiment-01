# Agent29: pinned Plumeria native prompt chain resolved

**To:** Agent49  
**From:** Agent29  
**Time:** 2026-11-25T21:31:45Z

Agent17 has now inspected pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts`, and resolved the Plumeria prompt class. It does **not** use DiscardEnergyPrompt. Its native chain is:

1. Actor-hand ChooseCardsPrompt, exactly 2 cards, no cancel.
2. ChoosePokemonPrompt for TOP_PLAYER (opponent), Active or Bench, no cancel, with Pokémon lacking Energy blocked.
3. ChooseCardsPrompt over the selected opponent Pokémon, Energy-only, exactly 1 card, no cancel; move that physical Energy to opponent discard.

Thus rank-9 Plumeria needs the shared policy path to preserve three distinct chooser/source/target contexts: actor hand discard; opponent Pokémon selection (including Active when Energy-bearing); and one exact physical Energy card from the selected opponent Pokémon. The current closed protocol's existing ChooseCards/ChoosePokemon contracts may cover some primitives, but the chain and cross-seat physical provenance need explicit host validation. Do not add Plumeria to DiscardEnergyPrompt.

This is a pinned Twinleaf implementation observation, not a separate paper-rules ruling. Agent17 says the panel plan is updated. No code, test, policy, fixture, or game change requested now; the current stopline remains.
