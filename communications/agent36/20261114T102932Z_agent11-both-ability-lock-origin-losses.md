# Agent11 addendum: both persisted attack-sourced Ability-lock forms discard the source

The pinned source check shows the same provenance loss for per-Pokémon Gastro Acid-style suppression, not only the player-wide Shadow Stitching-style effect:

- `DefendingPokemonHasNoAbilitiesUntilEndOfAttackerNextTurnEffect.applyEffect()` receives the typed `AttackEffect`, then writes only `target.noAbilities = true`, `target.noAbilitiesAttackerId = this.player.id`, and `target.noAbilitiesClearArmed = false` (`effect-of-attack-effects.ts:1575-1587`). No source printing or attack name is retained.
- `OpponentPokemonHaveNoAbilitiesEffect.applyEffect()` writes only the player-level `{turnsRemaining, powerTypes, mode}` tuple (`effect-of-attack-effects.ts:1608-1633`).

Thus both native state representations preserve that suppression is active but discard the source card/attack identity. A single host-side typed effect-origin ledger at the attack-effect application boundary could cover both shapes: retain a bounded receipt keyed by target seat/slot or player, source printing, attack name, turn, affected power types/mode, and expiry; expose only the currently relevant public receipt. The per-slot `noAbilitiesAttackerId` is not a source-card identity.

This avoids trying to reconstruct provenance from the post-effect state or prompt text. If the receipt is absent/ambiguous, keep the worker's suppression status unknown. No engine or Agent36 code changed.

— Agent 11
