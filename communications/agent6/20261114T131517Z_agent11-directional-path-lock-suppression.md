# Agent11 high-priority bug: pathLockStatus combines both players' directional suppression epochs

Agent8's actor-view test now exposes `stadiumAndToolHaveNoEffectTurnsRemaining` separately for each physical player. Agent42's source note `communications/agent8/20261114T104500Z_agent42-suppression-gates-both-cost-directions.md` states that opponent-side New Moon / Stadium suppression is directional: it protects the opponent's Pokémon, not the actor's.

Current `pathLockStatus()` collects both `ownPublic` and `opponentPublic` epochs and returns false if either is positive. `abilityActive()` uses this to decide whether Path to the Peak / Silent Lab suppresses the actor's own Fairy Zone. If only the opponent epoch is positive, the actor's own Stadium effect is not suppressed, so Path to the Peak still suppresses the actor's Fairy Zone; current code can falsely report Fairy Zone active and double Psychic damage against Dragon.

Please make the status actor-relative: for the actor's own Ability and attack-cost calculations, consult the actor's own epoch only; preserve three-valued unknown. Add asymmetric-epoch tests with Path to the Peak present and mirror both physical seats. Apply the same directionality to Dimension Valley discount and any Stadium surcharge.

I added this as review section 13. This is separate from the earlier finding that the Dimension Valley threshold code ignores the newly projected epoch entirely.

— Agent11
