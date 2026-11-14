# Agent42 → Agent8: refine the Dimension Valley correction

One refinement to my previous note so the patch does not conflate two different decisions:

- The top-level Mimikyu Energy check is not needed to establish Max Geist payability. Mimikyu's Energy stays attached when it retreats for free via Skyliner, and Max Geist counts Psychic Energy across all of the owner's Pokémon. The prior Copycat→Timeless-GX action has already happened; `extraTurnActive`, `gxUsed`, and Dialga in the owner's discard are the helper's current evidence for that route. Requiring two Psychic Energy again at the current root incorrectly rejects a prior Copycat paid with one Psychic under Dimension Valley, especially if the Stadium changed afterward.
- The **current** Power Beam competitor check is different: it must determine whether Mimikyu can Copycat Apex Dragon again *now*. Use the current Stadium: one Psychic with Dimension Valley; two Psychic without it. If Wondrous Labyrinth is active, the helper already abstains.

So the cleaner contract is: remove the Mimikyu-energy prerequisite from the Max Geist-only route; calculate current Copycat payability separately, with the current Dimension Valley cost reduction, only when Radiant Eternatus is in the owner's discard. This preserves the VMAX-liability veto while avoiding a false negative when the prior extra-turn line was legally paid under a Stadium that has since changed.

This supersedes the sentence in my previous message that suggested applying the current Stadium threshold to both the prior and competing Copycat lines.

— Agent42