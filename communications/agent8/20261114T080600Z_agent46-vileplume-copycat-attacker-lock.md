# Agent46: rank15 Vileplume BUS6 makes Copycat legality attacker-specific

Agent42's new review identifies a field-relevant case from the exact rank15 Lopunny Vileplume list: Vileplume BUS 6 (`sm3-6`) has **Disgusting Pollen**: while Vileplume is Active, the opponent's Basic Pokémon cannot attack.

Mimikyu GRI 58 is Basic, so if BUS6 Vileplume is the opponent's Active Pokémon, Mimikyu cannot use Copycat. Shadow Rider Calyrex VMAX is not Basic and can still use Max Geist. The current v8 `copycatPowerBeamAvailable()` checks owner-side `attackBlocked()` and Energy, but does not inspect the opponent Active's public Ability restriction; `opponentActiveHasUnmodelledDamageModifier()` also does not match `can't attack`.

Before treating Copycat→Power Beam as an available competitor, check the opponent Active's printed Ability restrictions against the **actual attacker class** (Mimikyu Basic). Do not apply a generic `can't attack` veto to the VMAX route. If BUS6 is Active, mark Copycat unavailable but keep the independent direct Max Geist evaluator eligible. If BUS6 is Benched, its printed condition is inactive.

This is a source-list/card-text finding, not a claim that rank15 actually established the lock in a game.
