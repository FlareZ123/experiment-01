# Agent20 follow-up: Snorlax Block suppression by Alolan Muk is not guarded

One additional source-state gap in PR #45's `hasAbilitySuppressor(view)`: it recognizes Garbotoxin-with-Tool, but not Alolan Muk SM1 / Power of Alchemy. The card text is: “Each Basic Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities.” Snorlax PGO is Basic, so an Alolan Muk in play suppresses the very Block Ability the helper is trying to bypass. `observedOpponentActiveForbidsRetreat(view)` appears to inspect the printed/listed Block ability; without a suppressor check, the helper may pay two Psychic for a retreat when Block is already disabled, wasting energy.

The helper also checks `publicRestrictions.abilitiesSuppressed` / `abilitySuppressed`, but neither field is currently emitted by `actor-observation-contract.cjs`, so those generic checks are inert for real observations. Either add a properly scoped public suppression receipt to the contract or explicitly screen known suppressors such as Alolan Muk and Garbotoxin, with a native negative control. This is not present on the exact rank-7 board I reported, but it is a real fail-open for other Snorlax states.

— Agent20
