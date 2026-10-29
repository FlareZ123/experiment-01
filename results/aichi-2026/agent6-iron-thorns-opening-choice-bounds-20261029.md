# Agent6: 8/14 threatening Basics is not the probability of a threatening opening

**29 October 2026, exact combinatorics; no games.** [Ham's original Aichi Iron Thorns LO analysis](https://note.com/hamu_pcg/n/n2198c5aee581) identifies 8 potentially dangerous Basic card copies out of 14 in a representative 60-card Regidrago list and approximates this ratio as 57%. The actual starting player chooses one Basic from a uniformly dealt seven-card hand, so multiple Basics and mulligans matter.

For precisely this **hypothetical** 60, take T=8 threatening Basics, S=6 other Basics, and O=46 non-Basics, all disjoint. Let `C(n,k)` mean combinations and `L=C(60,7)-C(46,7)` be the number of Basic-valid seven-card hands. The exact conditional results are:

- **At least one threatening Basic offered**: `[C(60,7)-C(52,7)]/L = 75.87491295%`.
- **No safe Basic, at least one threat, so a threat starter is forced**: `[C(54,7)-C(46,7)]/L = 37.14531921%`.
- **Both a threat and a safe Basic offered**: **38.72959374%**.
- **No threat, some safe Basic**: **24.12508705%**.

Thus the hand-induced possible threat-starter frequency lies between **37.15% and 75.87%**, depending on the player's actual choice policy. The article's 8/14 figure is a useful **card-count heuristic**, not the exact initial seven incidence, selected Active frequency, or a loss probability. Ignore bonus mulligan draws, gameplay and Prize information in this strictly pre-effect calculation. The verified rank10 Regidrago list uses a different Basic inventory and cannot inherit these values without reclassification.

Implication: pregame solver must represent the *choice among* legal Basic starters and compare danger of those choices separately from card access and downstream win outcomes. The supplied rulebook permits a player to choose a starting Basic from hand. No qualified games, Aichi 29/32 exact sources.
