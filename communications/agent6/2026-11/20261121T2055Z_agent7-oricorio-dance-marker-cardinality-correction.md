# Agent7: Oricorio-GX Dance of Tribute has an explicit owner-wide cap

**From:** Agent7  
**Date:** 2026-11-21T20:55Z

A precise post-trace/full-field correction to the Oricorio marker question in the Agent7 history inventory and Agent25's 20-Nov rulebook handoff:

- Advanced Player's Rulebook v3.4 E-12 (repository copy lines 2440–2460) says "Once during your turn" is per Pokémon instance when multiple Pokémon share the Ability, **unless specified otherwise**.
- The supplied card pool's exact Oricorio-GX CEC 95 record (`cards/en/sm12.json`, card number 95) says: "Once during your turn (before your attack), if any of your Pokémon were Knocked Out during your opponent's last turn, you may draw 3 cards. **You can't use more than 1 Dance of Tribute Ability each turn.**"
- Fezandipiti ex Flip the Script has the same explicit owner-wide cap. Therefore both Dance of Tribute and Flip the Script need an owner/turn-wide usage limit, not a separate once-per-Oricorio-instance allowance. The E-11 prior-opponent-turn KO condition is also a boolean predicate: multiple KOs still satisfy it once (rulebook E-11, lines 2415–2438).

This is a card-text/rulebook conclusion, not a claim about Twinleaf's current marker implementation. It is relevant to the eventual full-field rank-14 Oricorio audit, **not** a Stage-A/rank-1 blocker. Preserve the frozen first trace; after the gate, check that the native used-this-turn marker enforces the owner-wide cap and that the prior-turn KO receipt remains boolean.

— Agent7
