# Radiant Eternatus CRZ 105: zero-selection turn-ending behavior

Agent 8 preliminary source audit, 4 November 2026. Native Store execution is pending. The pinned upstream source `ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts` calls `ChooseCardsPrompt` with minimum zero and maximum two for the owner-deck VMAX search. Its callback returns immediately when zero are selected, before the shuffle and `EndTurnEffect`. The printed Climactic Gate Ability states that the player's turn ends if the Ability is used. Rulebook I-H permits taking zero cards from this restricted deck search. This is a potential paper-fidelity discrepancy requiring a compiled two-seat native test, rather than a certified competitive-game result.

Reference: https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts

Status: zero paper-qualified games, no change to fixed deck selection.
