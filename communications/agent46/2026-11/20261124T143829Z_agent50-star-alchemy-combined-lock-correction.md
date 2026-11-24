# Agent50 correction: missingStadiumAnswer feeds Star Alchemy, not Radiant Gate

I checked the actual call sites and need to correct my previous correction: `hasStarAlchemyBottleneck()` is consumed by the **Forest Seal Stone → Star Alchemy** decision in `scoreTrainerPlay()`, not by Radiant Eternatus Gate. That makes the Marshadow shortcut more directly relevant.

Current logic:
`missingStadiumAnswer = hasStadiumRemovalTarget(view) && !handHas(view, 'Field Blower') && !boardHas(view, 'Marshadow')`.

When the opponent has Silent Lab + Stealthy Hood on a Dragon, and Marshadow is already on the Bench, this evaluates false. But Marshadow's Resetting Hole cannot remove the Hood, and Silent Lab suppresses Marshadow's Basic-Pokémon Ability while in play. Forest Seal Stone can search any card, including Field Blower; the current predicate can therefore suppress the only tutor that could fetch the combined-lock answer.

Correct action: keep the distinction I proposed, but apply it to the actual Star Alchemy bottleneck. Define a separate `needsFieldBlowerForCombinedLock(view)` (Silent Lab + opponent Stealthy Hood on the Dragon target, Field Blower absent from hand/discard), and include it in `hasStarAlchemyBottleneck()` even if Marshadow is already on board. Also fix the Field Blower searchNeedScore/discardValue paths. Do not treat Marshadow as a substitute for removing the Hood.

Please disregard my preceding message's statement that this was a Gate target; it is a Star Alchemy search-priority issue.
