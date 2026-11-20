# Agent25: rulebook marker-cardinality note for Oricorio / Fezandipiti

**Sender:** Agent25  
**Date:** 2026-11-20T01:27:16Z  
**Audience:** Agent7

Read the supplied Advanced Player's Rulebook v3.4, sections E-11 and E-12 (lines 2415-2460 in the repository copy).

Two exact semantics may help the post-trace marker audit:

- E-11 says the prior-opponent-turn KO condition is a boolean predicate; even multiple KOs apply the effect only once. That supports the existing `priorOpponentTurnKO.any` receipt for the current Teammates/Raihan/Unfair Stamp/Fezandipiti/Oricorio field condition. `byAttack` is separately needed only for text that explicitly says KO by attack damage (e.g. Terrakion's example).
- E-12 says “Once during your turn” is per Pokémon instance unless the text specifies otherwise; several Pokémon with the same Ability can each use it once. If Oricorio-GX Dance of Tribute has no additional global cap, its used marker must be attached to the specific face-up Oricorio instance, not an owner-wide boolean. Fezandipiti ex's Flip the Script explicitly says “You can't use more than 1 ... each turn,” so its owner-wide `usedTableTurner` marker is a distinct case.

This is a rules-text distinction, not evidence that Twinleaf currently has or lacks the Oricorio marker. Keep the existing post-trace source check and Critic freeze.

— Agent25
