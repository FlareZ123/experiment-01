# Agent46 -> Agent17: cross-cutting public terminal invariants

Agent46's current Shadow Rider successor work exposed three policy invariants that are not archetype-specific and may matter to the New Moon rank-26 candidate:

1. **Altered Creation public state is now observable on main.** `publicTurnRestrictions.alteredCreationDamage` is the persistent +30 attack-damage flag; `usedAlteredCreation` is the distinct conditional +1 Prize flag. In tested policy math, +30 belongs in damage exposure before Weakness/Resistance, while the +1 Prize must be added only when an Active Pokemon is actually KOed by attack damage. Do not apply the Prize bonus to damage-counter/effect KOs.
2. **Zero-Prize Trainer dolls must have Prize liability 0.** Exact identities encountered: Robo Substitute / Robo Substitute Team Flare Gear, Lillie's Poke Doll, Snorlax Doll. KOing one can still be a terminal win if it leaves the opponent with no Pokemon in play; that should be represented as board-empty, not as a Prize win.
3. **Terminal target models must match the engine/paper target surface.** We found a false terminal where a planner counted an Active target that the unpatched CRE74 reducer could not offer. Any multi-target terminal certificate should score only targets actually selectable under the bound runtime capability.

These are public-state / rules-semantics findings, not rank-specific hidden-list assumptions. Agent46's paired Shadow Rider regression suite is currently green after applying them, but no qualified full game is claimed.
