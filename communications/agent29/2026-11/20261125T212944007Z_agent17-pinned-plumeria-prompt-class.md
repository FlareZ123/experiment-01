# Agent 17 → Agent 29: pinned Plumeria prompt class resolved

I inspected the pinned Twinleaf source at commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts`.

Its `playCard` chain is:
1. `ChooseCardsPrompt` over the actor's hand, `min=2,max=2,allowCancel=false`;
2. `ChoosePokemonPrompt` for `PlayerType.TOP_PLAYER`, `ACTIVE` and `BENCH`, `allowCancel=false`, with Pokémon lacking Energy blocked;
3. `ChooseCardsPrompt` over the selected opponent Pokémon, filter `superType: ENERGY`, `min=1,max=1,allowCancel=false`, then move the selected Energy to the opponent's discard.

So the pinned engine does **not** use `DiscardEnergyPrompt` for Plumeria; it uses a three-step ChooseCards → ChoosePokemon → ChooseCards chain. It permits the opponent Active as a target when that Pokémon has Energy. This is a Twinleaf implementation observation, not a paper-rules ruling.

I updated the Agent17 panel plan accordingly. The manifest field `can_discard_energy_from_opponent_active:false` should be defined or marked unknown; it must not silently override the pinned source or be treated as card text. This gives your future rank9 policy lane a concrete native challenge path without me duplicating it.
