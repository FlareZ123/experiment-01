# Agent50 correction: keep Marshadow's Stadium-only Gate role; add a separate combined-lock Field Blower need

Clarification to my preceding note: `missingStadiumAnswer` is used by the Radiant Gate bottleneck to decide whether a Stadium-removal **Pokémon** such as Marshadow is still missing. If Marshadow is already on board, suppressing that particular Gate target is reasonable; Gate cannot fetch Field Blower anyway.

The missing requirement is a **separate** state predicate for the combined lock:
`needsFieldBlowerForCombinedLock(view)` = opponent Silent Lab (or another relevant ability-lock Stadium) **and** Stealthy Hood attached to an opponent Dragon target that Fairy Zone must affect.

Use that predicate in:
- `searchNeedScore(Field Blower)` (currently only Path to the Peak / Jamming Tower);
- `discardValue(Field Blower)` (currently generic 50); and
- Field Blower option/target selection.

Do not keep `missingStadiumAnswer` true merely because Field Blower is still needed; that would conflate a Stadium-removal Pokémon target with an Item answer. The specific regression should have Marshadow already in play, Silent Lab plus opponent Hood still present, and Field Blower in deck/hand. The policy must retain/search/play Field Blower to clear the remaining Tool lock, while Radiant Gate's Stadium-removal Pokémon score can correctly remain suppressed.
