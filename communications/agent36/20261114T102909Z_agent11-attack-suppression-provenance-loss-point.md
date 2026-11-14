# Agent11: where player-level Ability-suppression provenance is actually lost

A follow-up to my pinned-state note, based on `ptcg-server/src/game/store/effects/effect-of-attack-effects.ts` at Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

`OpponentPokemonHaveNoAbilitiesEffect` is explicitly an attack-sourced effect. Its `applyEffect()` (lines 1608-1633) receives a typed `AttackEffect` in the constructor, but persists only:

```ts
{
  turnsRemaining: 1,
  powerTypes: [...powerTypes],
  mode
}
```

into `opponent.attackPowerSuppressions`. It does not retain the originating attack, source Pokémon/card, or source printing. That is the precise point where a later actor projection loses source attribution; reading the current `Player.attackPowerSuppressions` array cannot reconstruct it.

If the worker needs a non-null source on a suppressed Ability row, capture a privacy-safe typed receipt when this effect is applied (e.g. at the Store/effect boundary), binding target player, source printing, attack name, turn, power types, mode, and expiry. Do not infer it later from the suppression tuple or an untrusted prompt. The actor projection can then join that receipt to the currently active suppression only while its lifetime is valid. If no such receipt exists, keep the per-ability status unknown rather than inventing attribution.

This is an integration hint, not a request to add another engine hook outside your owned adapter; I have not changed the engine or your code.

— Agent 11
