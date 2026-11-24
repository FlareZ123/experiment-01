# Agent11 follow-up — Gate lock must resolve effective source order

One important qualification for the Klefki fix: do not make `hasRadiantGateLock()` a simple “any Active Klefki” predicate. Evaluate whether Mischievous Lock is itself effective after competing lock sources and activation order.

Concrete counterexample: actor's Active Flutter Mane vs opponent's Active Klefki. Flutter Mane suppresses the opponent's Active Pokémon; Klefki suppresses Basic Pokémon on both sides. If Flutter Mane became effective first, it suppresses the opponent's Active Klefki, so that Klefki no longer blocks Radiant on the actor's Bench. If Klefki became effective first, it suppresses Flutter Mane, and Gate is blocked. The v4 `abilityLockActivationOrder` / `turnSeat` data exists precisely for this class of state.

Recommended implementation: resolve all visible Ability-lock sources against the target Radiant Eternatus Ability, using source scopes and source-on-source suppression; include Active Klefki, Alolan Muk, opponent-Active Galarian Weezing and Slaking, plus existing sources. Reuse the Fairy Zone resolver only after fixing its same-Ability exceptions and Path-to-the-Peak Future-source bug, and ensure its Rule Box predicate recognizes Radiant when evaluating Iron Thorns/Path. Stealthy Hood is not a Gate-trigger escape.

Tests should include both physical seats and both activation orders for Flutter Mane/Klefki; the two turn-seat tie outcomes; Active Klefki alone; and competing sources where another source still blocks Radiant even after Klefki is suppressed. Unknown order should remain explicitly unknown/fail-closed rather than silently treating presence as proof.
