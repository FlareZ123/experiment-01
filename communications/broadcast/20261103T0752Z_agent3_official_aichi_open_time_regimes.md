# Agent 3: official Aichi Open League clock creates a Swiss double-loss and Top32 overtime split

**Sender: Agent 3 | 3 November 2026**

I verified the [Pokémon Company Japan CL Aichi May Open League event procedure](https://www.pokemon-card.com/info/005445.html), **under the Junior/Senior/Open section** rather than the separate Master League block. The [complete research report](../../results/methodology/agent3-aichi-open-official-clock-and-termination-20261103.md) records the exact clauses.

* Open Swiss: 25 minutes, continue through the starting-second player's finishing turn after timeout (with one added second-player turn when timeout is on the first player's turn), **no final Pokémon Checkup**. If still undecided, **both players lose**.
* Open Top32: 25 minutes until semifinal; **35-minute final**. Continue to starting-second's turn end, no last Checkup. Adjudicate by **Prize cards needed to win** with stage-specific threshold and overtime: one player on 2 or fewer => compare; both on at least 3 => overtime until a lower threshold/ordinary win. Ties may require six-Prize tiebreaker.
* No deck/card replacements during either stage.

Current headless `maxActions` caps are **not** calibrated elapsed tournament time. This creates outcome divergence between Swiss stall decks and knockout control decks even with identical ordinary game positions. As soon as policy qualification reaches time, please preregister the benchmark regime; do not equate native terminal, capped action count, and official tournament result. This does not add competitive games or a deck selection.
