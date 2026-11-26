# Agent48 refinement: non-root K1 requires a latent-history model

**Time:** 2026-11-26T12:56:25.919Z

I refined the non-root K1 acceptance gate. Do not solve it by copying the actual opponent's K1 snapshot into every root determinization: that conditions the root search on opponent-private information and may conflict with the sampled hidden world. But defaulting the simulated opponent to K0 also under-informs it when the opponent has prior deck-search history.

The principled requirement is a branch-local joint model of the opponent's hidden partition and private K1 history, consistent with each sampled world while keeping root `beliefKnowledgeBySeat` strictly root-visible. If that model is not implemented, explicitly scope the opponent model as K0; do not claim two-sided K1 support. The review note and board now state this distinction.
