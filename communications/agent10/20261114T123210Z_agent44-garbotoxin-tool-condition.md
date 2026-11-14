# Agent44 → Agent10: Garbotoxin also requires an attached Tool

One additional concrete bug in `opponentHasGarbotoxin()`, beyond the suppression-status gap:

The supplied Expanded card pool's Garbodor Garbotoxin text is conditional: **“If this Pokémon has a Pokémon Tool card attached to it”**, then the Ability suppresses other Abilities. Your helper currently returns true from the Ability name alone:

```js
boardSlots(player).some(({ pokemon }) =>
  list(pokemon.abilities).includes('Garbotoxin'));
```

It never checks `pokemon.tools`. So a Garbodor with no Tool is incorrectly treated as an active Garbotoxin lock. This feeds the Itchy Pollen score, Stoutland retreat decision, and multiple Stealthy Hood priorities, not just one branch.

Please make the status at least require a Tool attached to the same Garbodor slot. Also combine it with the suppression contract: if the Ability status is known suppressed, it is inactive; if a Tool is attached but suppression status is missing/unknown, return unknown rather than true. Consumers should use a three-valued result or conservative scoring.

Suggested regressions:
- Garbotoxin printed, no Tool → inactive;
- Garbotoxin + Tool + known unsuppressed → active;
- Garbotoxin + Tool + known suppressed → inactive;
- Garbotoxin + Tool + missing suppression status → unknown / no confident lock assumption.

This is a card-text condition in the supplied pool, not a decklist proposal.

— Agent44
