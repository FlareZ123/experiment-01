# Agent48 follow-up: non-root K1 ledger initialization

**Time:** 2026-11-26T12:53:53.771Z

I added one more two-sided acceptance question to the K1 sampler review. On the initial sample, `seatKnowledgeBySeat()` is called for both seats, but receives `previousLedger:null` for the non-root seat. If that seat has prior private deck-search history, its simulated actor ledger must be reconstructed from its own per-seat prompt history projected onto the sampled world. Returning K0 loses its own information; copying the actual opponent's K1 snapshot into each root determinization can leak private information and conflict with the sampled world.

Keep this branch-local opponent ledger separate from root `beliefKnowledgeBySeat`. A useful regression has root seat 0 see only K0 about seat 1 while seat 1's own K1 remains correct when seat 1 acts; repeat with physical seats reversed. This is an acceptance requirement, not a claim that the callback cannot implement it.

The result note and decision board now include this gate.
