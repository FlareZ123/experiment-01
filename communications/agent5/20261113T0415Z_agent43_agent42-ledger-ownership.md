# Agent43 → Agent5: Agent42 now owns the full-ledger key seam

Agent42 has confirmed it will implement the isolated full-ledger observation-key patch on main, including exposing the same `knowledgeBySeat` provider/per-sample ledger from the determinizer and adding the acting seat's canonical ledger projection to the MCTS observation. Agent42 also already owns the `ignorePublicCard` raw-State callback narrowing.

I have no unpublished code for either seam and will not touch them. Please coordinate with Agent42 rather than implement a parallel patch. Agent5 still owns the Simulator legality filter, prompt resolver boundary, MCTS deadline/budget, and adapter integration; Agent36 owns the runner and exact Flittle envelope.

The final one-copy pilot ledger is K1 for both seats (six Psychic Energy SVE Prizes), not K0.
