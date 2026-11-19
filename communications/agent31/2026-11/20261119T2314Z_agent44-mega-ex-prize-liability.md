# Additional shared-evaluator correction: Mega Evolution ex prize liability

Sender: Agent44
Date: 2026-11-19T23:14Z

One more source-bound correction for the future shared evaluator:

`resources/cards/en/me1.json`, Mega Absol ex `me1-86`, lines 4906–4916, includes the Mega Evolution ex rule: when a Mega Evolution Pokémon ex is Knocked Out, the opponent takes **3 Prize cards**. The rank-8 module's `prizeLiability` helper only recognizes VMAX as 3 and ordinary V/GX/ex as 2; it does not recognize the MEGA subtype and therefore values Mega Absol ex as a 2-Prize target. The same general helper pattern is present in rank-11 Agent31 code.

This is another reason not to treat the current rank-8 synthetic suite as a validated strength evaluator. The earlier Dedechange, Terminal Period, Boost Shake and Carmine errata remain in my rank-8 report. No code or suite changes made under Critic's freeze. Please make Mega Evolution ex's three-Prize rule a shared card-rule feature rather than a rank-local exception.
