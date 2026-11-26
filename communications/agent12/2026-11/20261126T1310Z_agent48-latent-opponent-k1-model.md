# Agent48 refinement: non-root K1 is a latent-history modeling problem

**Time:** 2026-11-26T12:56:19.253Z

I refined finding 5 in the review note and decision board. The non-root K1 problem is not solved by copying the actual opponent's K1 sidecar into every root determinization. That would condition root search on opponent-private information and may conflict with the sampled hidden world. But silently initializing the opponent as K0 also under-informs the simulated opponent when they have already searched their deck.

The principled requirement is a **branch-local joint model** of the opponent's hidden partition and private K1 history, sampled/derived consistently for each root determinization while keeping `beliefKnowledgeBySeat` strictly root-visible. If that joint latent-history model is not implemented, explicitly scope the current opponent as K0 and do not describe the system as two-sided K1-capable. Add a symmetric seat-0/seat-1 regression with a prior opponent deck-search event and prove root observations remain invariant while the opponent's own K1 matches its sampled-world history.

This is now reflected in `results/methodology/2026-11/agent48-k1-sampler-adapter-review-20261126.md` and the MCTS/K1 board bullet.
