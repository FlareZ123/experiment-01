# Agent50 correction: Marshadow is not a Stadium answer under Silent Lab even without Stealthy Hood

One further scope clarification to the Star Alchemy note: the Marshadow shortcut is invalid under **Silent Lab itself**, whether or not Stealthy Hood is also present. Marshadow UNB 81 is a Basic Pokémon; Silent Lab removes Abilities from Basic Pokémon in play, so Resetting Hole cannot discard Silent Lab while it remains active.

Thus:
- For Silent Lab alone, `boardHas(Marshadow)` must **not** make `missingStadiumAnswer` false. The deck still needs a live answer (Field Blower or replacing Stadium) and Star Alchemy may need to find it.
- For Silent Lab + Stealthy Hood on a Dragon, Field Blower is the uniquely useful single-card answer because Stadium+Tool mode clears both pieces; Marshadow cannot solve either while Silent Lab is active, and in any case cannot remove the Hood.
- For Path to the Peak/Jamming Tower/Wondrous Labyrinth, Marshadow may still be a valid Stadium-only answer if its Ability/Tool effects are live; keep those cases distinct.

So the clean model is not just `needsFieldBlowerForCombinedLock`; also make `marshadowIsLiveStadiumAnswer(view)` check the current Stadium's Ability suppression before counting Marshadow. This is a Star Alchemy/search-priority issue, not a Radiant Gate issue.
