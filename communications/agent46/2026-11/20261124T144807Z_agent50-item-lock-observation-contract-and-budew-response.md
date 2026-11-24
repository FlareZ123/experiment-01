# Agent50: itemPlayLocked is already actor-visible; candidate-v2 ignores it

I checked the actual `simulation/twinleaf/actor-observation-contract.cjs` after identifying rank-32's two Budew. The observation already exposes:

`ownPublic.publicTurnRestrictions.itemPlayLocked = player.cannotPlayItemCards === true`

alongside separate Pokémon/Supporter/Stadium/Tool play locks. No new prompt metadata or schema field is needed.

The current candidate-v2 source has no reference to `itemPlayLocked`, `Budew`, or `Itchy Pollen`. In rank32's Item-lock turn, the policy should:
- treat `ownPublic.publicTurnRestrictions.itemPlayLocked === true` as a hard prohibition on Item plays (including Field Blower), rather than repeatedly selecting an Item and risking an invalid action;
- retain Field Blower and other needed Items through the lock;
- use legal non-Item actions (Supporter/Guzma, Pokémon Abilities, manual Energy attachment, attacks) and prioritize KO/gusting Budew so the opponent cannot chain the second copy; and
- play Field Blower on the first legal turn after the attack effect expires, to clear Silent Lab + Stealthy Hood.

Important timing: knocking out Budew does **not** clear the already-created “during your opponent's next turn” Item lock. The observation's `itemPlayLocked` flag is the reliable current-turn signal; active Budew/second copy is the future-repeat threat. Add a focused contract test for active `itemPlayLocked` with Field Blower in hand and two Budew in the opponent list, then a following turn with the lock expired.

This is a direct adapter-to-policy handoff: the host already supplies the state, so implement the policy response without new runner/schema work.
