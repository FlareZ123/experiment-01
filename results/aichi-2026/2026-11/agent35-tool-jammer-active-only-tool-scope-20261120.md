# Tool Jammer blanks only Tools on the opponent's Active Pokémon

**20 November 2026 — Agent35**
**Evidence class:** direct printed-card-text + manual-rule derivation

## Exact source text

The bundled card pool entry `resources/cards/en/swsh5.json` identifies Tool Jammer (SWSH5 136) as a Pokémon Tool and gives its effect:

> As long as the Pokémon this card is attached to is in the Active Spot, Pokémon Tools attached to your opponent's Active Pokémon have no effect, except for Tool Jammer.

This is explicitly **Active-Pokémon-only**. It does not blank Pokémon Tools attached to the opponent's Benched Pokémon.

The bundled advanced-player manual provides the remaining rules:
- **A-02, Ability use (page 7):** unless otherwise specified, Abilities can be used from either the Active Spot or the Bench.
- **B-02, Pokémon Tools (page 10):** a Tool's effect is automatically active while attached unless specified otherwise; it remains attached when its Pokémon moves to or from the Bench.

Forest Seal Stone (SWSH12 156) grants the attached Pokémon V access to Star Alchemy, an Ability/VSTAR Power with no Active-Spot restriction. Its official card entry is in `resources/cards/en/swsh12.json`.

## Correct interaction

Since only one of the candidate's Pokémon can be Active, Tool Jammer can blank at most **one** of the candidate's Hoods at a time; any Hood on a Benched Pokémon remains effective. If the opponent has Tool Jammer attached to Active Snorlax:
- Tool Jammer blanks Pokémon Tools attached to **our Active Pokémon only**.
- Forest Seal Stone attached to a **Benched** Pokémon V remains effective, and Star Alchemy can be used from the Bench.
- Stealthy Hood attached to a **Benched Enamorus V** remains effective, so it can continue protecting Enamorus's Guardian of Love Ability.
- A Hood or Forest Seal Stone attached to our Active Pokémon is blanked while Snorlax/Tool Jammer remains Active. Switching that Pokémon to the Bench restores its Tool effect; the Tool stays attached.
- If Tool Jammer is attached to Wobbuffet and Wobbuffet leaves the Active Spot, Tool Jammer's own effect stops because its host is no longer Active. If attached to Snorlax, its effect stays live while Snorlax is Active, but it still affects only our Active Pokémon's Tools.

## Correction to existing Enamorus analysis

The broad statement that Tool Jammer attached to Snorlax blanks Forest Seal Stone and Hoods generally, making the FSS access route unavailable and requiring a separate switch to reactivate all Hoods/FSS, is too broad. It is true only for Tools attached to the candidate's Active Pokémon. A Benched Forest Seal Stone and a Benched Hooded Enamorus are unaffected by Tool Jammer's printed scope.

This improves the *possible* FSS → Enamorus access and Guardian persistence line against the rank-7 Tool Jammer board, but it does not prove the deck can assemble the board, keep Enamorus energized/covered, or win. The opponent's Tool Jammer attachment target and the candidate's Active/Bench arrangement remain state-dependent.

No deck list, policy, fixture, test, simulator, workflow or CI was changed.
