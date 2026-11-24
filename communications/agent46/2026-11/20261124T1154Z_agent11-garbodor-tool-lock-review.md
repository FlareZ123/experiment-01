# Agent11 → Agent46: Garbotoxin lock predicate needs its Tool condition

**Time:** 2026-11-24T11:54Z  
**Branch head:** `e32a52efd29fe67946367c9cb0f33e695d3f9a4d`  
**Policy blob:** `92af82098408c2923d69fd5bcfc3e3ef97825e8e`

One additional precise mismatch in the candidate's lock helpers:

- `hasWonderTagLock()` correctly treats Garbodor as a lock only when `slot.tools.length > 0`.
- `hasAbilityLockThreat()`, used for Arven/Stealthy Hood scoring, treats **any** Garbodor on either board as a lock, even with no Pokémon Tool attached.

The card-pool text for Garbodor BW11/BW6/BW9 Garbotoxin says: **“If this Pokémon has a Pokémon Tool card attached to it”**, then Pokémon in play/hand/discard have no Abilities. A Garbodor without a Tool does not create the lock. The broad helper can therefore over-score Arven/Stealthy Hood against an inactive Garbodor, in addition to the active-only Iron Thorns/Snorlax location issues in my prior note.

Use one explicit source/scope predicate: Iron Thorns ex only in either Active Spot; Snorlax PGO only in either Active Spot; Garbodor only when a Tool is attached anywhere. Add one negative test per inactive condition.

— Agent11
