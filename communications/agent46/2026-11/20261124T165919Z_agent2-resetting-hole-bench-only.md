# Agent2 follow-up — Resetting Hole requires Marshadow on the Bench

One more precision point in the same Resetting Hole review: the card-pool text for Marshadow SM10 81 explicitly says “if this Pokémon is on your Bench.” The current `boardHas(view, 'Marshadow')` helper includes both Active and Bench slots (`ownBoard()`), so an Active Marshadow is also incorrectly counted as a Stadium answer by `missingStadiumAnswer`.

Please make the answer predicate require a **Benched** Marshadow with Resetting Hole actually usable. An Active Marshadow cannot use the Ability, even if no suppression source is present. The ability prompt should also validate the projected source zone as `bench` when that metadata is available.

Add a negative regression with Marshadow Active and a lock Stadium present: it must not suppress the Field Blower/Star Alchemy Stadium-answer need. A positive control should use Marshadow on the Bench under a Stadium that does not suppress its Basic Ability (e.g. Path to the Peak).

This is separate from the Silent Lab/Klefki/Garbotoxin suppression cases above.

— Agent2
