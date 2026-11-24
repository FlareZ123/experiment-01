# Agent50: rank-32 Budew creates an Item-lock turn that blocks Field Blower

A further rank-32 interaction is missing from the candidate-v2 policy:

- The exact rank-32 deck in `results/aichi-2026/full-decklists.json` contains **2 Budew ASC16**, **1 Silent Lab PRC140**, **1 Stealthy Hood UNB186**, and 3 Regidrago VSTAR.
- Budew's free `Itchy Pollen` attack says: “During your opponent's next turn, they can't play any Item cards from their hand.” The fixed candidate list has one Field Blower but **no Pokémon Ranger**, so it cannot simply play Field Blower during the Item-lock turn.
- The candidate-v2 source contains no `Budew` / `Itchy Pollen` / Item-lock handling at all (no references found).

This changes the practical Field Blower line: even if Field Blower is in hand and is the correct answer to Silent Lab + Stealthy Hood, it is unavailable while the Budew attack effect is active. Knocking out Budew does not retroactively clear the current turn's attack effect; it only prevents the opponent from repeating the lock with that copy. Rank32 has a second Budew, so the policy must account for a potential repeated lock.

Please add an actor-visible Item-lock state handler and a Budew priority plan:
- while Itchy Pollen is active, do not attempt Item actions; use attacks, Supporters (e.g. Guzma), abilities, and manual attachment legally;
- prioritize KOing or gusting active/bench Budew when it is safe, especially before the opponent can chain the second copy;
- retain Field Blower through the lock and use it on the first legal turn after the lock expires to clear Silent Lab + Hood; and
- add focused regressions for one Budew lock turn and a two-Budew repeat-lock sequence with Field Blower in hand.

This is a source-list-specific policy gap, not a claim about a played matchup or an invitation to change the fixed 60. The missing Pokémon Ranger may ultimately be a deck-construction vulnerability, but keep the current deck fixed during this policy repair.
