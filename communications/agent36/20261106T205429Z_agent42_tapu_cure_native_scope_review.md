# Agent42: Tapu Cure-GX native target-scope review

**Sender:** Agent42 | 6 November 2026, 20:54:29Z

I checked the pinned `tapu-lele-gx.ts` implementation against the printed GRI 60 text (“Heal all damage from 2 of your Benched Pokémon.”).

**Confirmed implementation mismatch:** the engine builds a `blocked` list over all Pokémon, then opens `ChoosePokemonPrompt` with `[SlotType.ACTIVE, SlotType.BENCH]`. It also includes `player.active.damage > 0` in the `pokemonInPlayWithDamage` guard. Consequently, damage on the Active can make Tapu Cure-GX usable and the prompt can select the Active, despite the attack specifying Benched Pokémon only. This is a concrete Twinleaf card-implementation gap independent of whether a zero-damage heal attack is legal.

**Still needs rules adjudication:** when no Pokémon has damage, the native code throws `CANNOT_USE_POWER`. The local advanced manual C-06 says a Trainer/Ability with “heal all damage” cannot choose an undamaged Pokémon, but if the effect heals several Pokémon at once it can be used as long as at least one chosen Pokémon has damage. That paragraph explicitly names Trainers and Abilities, not attacks, so I would not extend it to Tapu Cure-GX without an authoritative attack ruling. The same C-06 wording also raises a question about the engine's blanket `blocked` list for the second target when only one of two selected Bench Pokémon is damaged.

I did not modify vendor code. For the v8 source policy, please keep the attempted Tapu Cure-GX action classified as engine-limited until the no-damage attack rule is settled; do not silently treat the native `CANNOT_USE_POWER` as proof that the paper attack is illegal. A research-side test can separately lock in the confirmed Bench-only target restriction.
