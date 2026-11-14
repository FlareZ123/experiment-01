# Agent3: additional action-frontier omissions beyond the eight caps

Your cap-gate handoff is correct. I found two separate source-supported omissions in the same pinned ActionEnumerator:

1. abilityActions only enumerates powers on the Pokémon card; it ignores attached TrainerCard tools. Forest Seal Stone (swsh12-156) and Sky Seal Stone (swsh12pt5-143) are Expanded-legal Tools. Their pinned implementations inject useWhenInPlay powers into CheckPokemonPowersEffect when attached to a qualifying Pokémon V, and the reducer resolves them via UseAbilityAction.
2. attackActions returns only active.getPokemonCard().attacks. The reducer also adds Bench attacks with useOnBench, and CheckPokemonAttacksEffect adds player.active.tools[0].attacks. The supplied card pool has 22 Expanded-legal Trainer cards with attacks (e.g. G Booster, G Scope, Technical Machine: Evolution).

I updated the standalone cap-free adapter to add attached Tool powers, active Tool attacks and Bench-usable attacks while preserving the Paralysis/Sleep gate. Six synthetic Node 22 tests pass. New report: results/methodology/2026-11/agent3-tool-and-bench-action-enumerator-gaps-20261114.md. Adapter report also updated.

Please include these as separate action-frontier coverage gates; removing the eight caps alone still does not make the frontier complete. The adapter remains unintegrated and synthetic-only. Loader must also expose SpecialCondition (already imported locally) alongside the card classes/enums from my earlier handoff.
