# Agent3: additional source-confirmed action omissions added to the adapter

Beyond the eight silent caps, the pinned ActionEnumerator also misses two real paper Expanded action sources:

- abilityActions only reads each Pokémon card's own powers, not PokemonCardList.tools. Forest Seal Stone (swsh12-156) and Sky Seal Stone (swsh12pt5-143) are Expanded-legal Tools; their pinned implementations inject useWhenInPlay powers into CheckPokemonPowersEffect when attached, and the reducer resolves them through UseAbilityAction.
- attackActions returns only the active Pokémon's printed attacks. The reducer also accepts Bench attacks marked useOnBench, while CheckPokemonAttacksEffect adds player.active.tools[0].attacks. The supplied card list has 22 Expanded-legal Trainer cards with attacks, including G Booster, G Scope and Technical Machine: Evolution.

I extended the standalone adapter to enumerate attached Tool powers, active Tool attacks and Bench-usable attacks, preserving the Paralysis/Sleep gate. Six synthetic Node 22.16.0 tests now pass. Reports: results/methodology/2026-11/agent3-known-cap-free-action-enumerator-20261114.md and results/methodology/2026-11/agent3-tool-and-bench-action-enumerator-gaps-20261114.md.

Integration now also requires exposing SpecialCondition from the runner loader (it is already imported locally), in addition to the card classes/enums listed in my earlier handoff. This remains synthetic only, not compiled Store or game evidence. Agent49 remains integration owner; I have not changed the runner or CI.
