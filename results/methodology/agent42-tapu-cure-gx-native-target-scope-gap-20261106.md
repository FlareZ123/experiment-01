# Agent42: Tapu Cure-GX native target-scope gap

**Date:** 6 November 2026  
**Twinleaf revision:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

## Finding

Pinned Twinleaf's Tapu Lele-GX GRI 60 implementation has a confirmed target-scope mismatch with the printed Tapu Cure-GX attack.

Printed text:

> Heal all damage from 2 of your Benched Pokémon.

In `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts`, the `WAS_ATTACK_USED(effect, 1, this)` branch:

1. builds a `blocked` list by iterating over **all** of the player's Pokémon;
2. sets `hasPokeBenchWithDamage` from the Bench, but also sets `hasActiveWIthDamage` from the Active;
3. allows the attack whenever either the Bench or Active has damage;
4. opens `ChoosePokemonPrompt` with both `SlotType.ACTIVE` and `SlotType.BENCH`, with `min: 1, max: 2`.

This means Active damage alone can pass the guard, and the prompt can select the Active Pokémon. Both behaviors conflict with the printed Bench-only target. The target-scope defect is independent of the unresolved question about whether a zero-damage healing attack can be used.

## No-damage legality remains unresolved

The engine throws `GameError(GameMessage.CANNOT_USE_POWER)` when no Pokémon in play has damage. The repository's advanced manual C-06 says a Trainer card or Ability with a “heal all damage” effect cannot choose a Pokémon with no damage; for an effect healing several Pokémon at once, it may be used if at least one selected Pokémon has damage. That paragraph explicitly names Trainers and Abilities, not attacks. It is insufficient by itself to decide whether Tapu Cure-GX may be used when no Pokémon is damaged.

The same manual wording raises a further question about the engine's `blocked` list: it blocks every undamaged Pokémon, whereas C-06 permits a multi-Pokémon heal effect to be used when at least one selected Pokémon has damage. Whether that rule applies to attacks needs authoritative adjudication.

## Relevance to the v8 mirror canary

The v8 source-side policy attempted Tapu Cure-GX with one Psychic Energy and no damage on its side; the pinned engine rejected it. Until the attack-specific paper rule is established, this is an engine-limited policy action, not proof that the paper attack was illegal. The v8 result remains a same-60 mirror completion canary with zero paper-qualified competitive games.

## Next validation

- Add a research-side native Store regression proving that Tapu Cure-GX cannot select the Active, even when it is damaged.
- Establish the no-damage and partially-damaged multi-target legality from an authoritative attack ruling before changing the engine behavior.
- Keep the upstream submodule untouched. If a simulator correction is needed, implement it through a research-owned adapter hook and preserve the pinned upstream revision.

No card-interaction conclusion beyond the confirmed Bench-only target mismatch is claimed here.


## Pinned source locations

In `vendor/twinleaf/ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts` at the pinned revision:

- lines 176-181 build `blocked` by iterating `player.forEachPokemon`, including the Active;
- lines 183-185 combine Bench damage and Active damage into `pokemonInPlayWithDamage`;
- lines 187-189 reject only when neither Active nor Bench has damage;
- lines 195-200 offer both `SlotType.ACTIVE` and `SlotType.BENCH`.

The mismatch can be reviewed directly at those pinned lines; no inference from a failed game log is needed.


The manual reference is `resources/manual/EN_advanced_manual-2025-transcription-structured.md` lines 1180-1183 (C-06). Its text is explicitly scoped to Trainer cards and Abilities, which is why it does not settle the attack-specific no-damage question.
