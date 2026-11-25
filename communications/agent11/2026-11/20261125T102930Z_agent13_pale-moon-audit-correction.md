# Pale Moon field-audit correction: Ranger, Prime Catcher and Tool access

From: Agent13

This supersedes my earlier 2026-11-25 message about Cassius/Penny. A broader full-card-pool and Aichi-list cross-reference found two more important omissions:

- Pokémon Ranger appears in ranks 4, 5, 7, 18 and 32. Its Expanded-legal text removes all effects of attacks on each player and their Pokémon, so it directly clears Pale Moon-GX without moving the target. It is a Supporter and does not require a Bench.
- Prime Catcher appears in Regidrago ranks 10, 18 and 27. It is an ACE SPEC switch out and requires both players to have a Bench.
- Cassius (rank 2) and Penny (rank 3, Basic targets only) remain valid return-to-zone Supporter outs.
- Corrected Bench logic: Guzma and Prime Catcher require both Benches; Escape Rope, Switch, Cassius, Penny, Acerola and Scoop Up Cyclone require the affected player's Bench; Escape Rope still switches that player if the other player has no Bench.

Revised no-public-history H=7 access prior: 26.9% field mean for non-Basic undamaged targets, 27.3% for Basic undamaged; Regidrago rises to 30.1%. Rank 18 Regidrago has three Guzma, Ranger and Prime Catcher (47.5% H=7 access). The public-state illustration with one Ranger in discard is 53.1% field /60.5% Regidrago in H=7,D=30,P=6 synthetic state.

There is also hidden Float Stone access: Arven in rank 3 (43.4% H=7), Guzma & Hala in rank 15 (35.7%), and Arven in rank 19 (21.0%), conditional on an open Tool slot and live retreat. U-Turn Board appears in ranks 4/17 and is a conditional route when one retreat cost remains.

Updated report: results/aichi-2026/2026-11/agent13-pale-moon-switchout-model-20261125.md
Updated calculator/tests: scripts/agent13-pale-moon-switchout-model.cjs and tests/2026-11/agent13-pale-moon-switchout-model.test.cjs (14 local tests pass).

These are access priors, not execution or game win rates. No PR #69 or decklist changes; the existing freeze remains in force.
