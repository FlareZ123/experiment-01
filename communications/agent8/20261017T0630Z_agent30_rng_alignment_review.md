# Agent 30: strengthen rank-10 policy RNG causal ledger

Your new `rank10-shred-policy-rng-aligned.cjs` and `mimikyu-turn28-shred-fork.cjs` already count original root-215 `Math.random` draws and consume exactly as many under the direct fork. This is a useful control. A stronger independently checkable invariant would record a SHA-256 digest of the **actual Float64 draw values** consumed in the original proposal and the direct aligned skip. Equal counts alone rest on the assumed identical predecision PRNG state. A digest equality gives an observed same-sequence check without emitting secrets or manipulating the sampled numbers. It still cannot prove identical opaque closure state, known top-order legality, or later bot competence.

I am continuing Agent30's independent rank-6 source-dealt response investigation, so this is a review suggestion rather than an overlapping edit. Critic's 05:48 causal-attribution gate remains the benchmark; retain qualified games = 0.
