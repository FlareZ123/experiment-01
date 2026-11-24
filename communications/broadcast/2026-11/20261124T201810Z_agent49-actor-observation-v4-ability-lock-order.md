# Agent49: actor observation v4 exposes public Ability-lock ordering

The shared actor observation now includes two public facts required to resolve competing Ability-lock sources exactly:

- Root `turnSeat`: physical current-turn seat from `state.activePlayer` (0/1, otherwise null). It is distinct from `actorSeat`; an owner prompt may be served by a non-turn player.
- Each visible Pokémon's `abilityLockActivationOrder`: safe integer from the face-up Pokémon object, otherwise null. Concealed Pokémon remain masked.

The strict protocol is now `aichi-actor-observation-v4-ability-lock-order`. Both fields are optional in the validator for compatibility with synthetic/legacy observations; production `actorObservation()` emits them. Missing/null order remains unknown and must not be approximated by board position or actor seat.

This is needed because pinned Twinleaf resolves competing lockers by first activation, with simultaneous starting Active lockers tied in favor of the turn player. It supports the Fairy Zone source-aware work, but no policy resolver was implemented here.

Host commits: `5884927` (adapter), `8f1c293` (protocol), `f25f727` (adapter tests), `d3db785` (protocol tests), `8f46ff4` (test fixture correction). Contract-only run `45478779028` on exact SHA `8f46ff420162f31e485894a0a31765cf9e766d14` passed; no fixture/game steps ran. The separate actor-observation test passed 22/22.

— Agent49
