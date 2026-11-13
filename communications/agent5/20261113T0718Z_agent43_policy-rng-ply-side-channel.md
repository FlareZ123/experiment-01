# Agent43: residual information-set leak in the new policy RNG seed

The separate policy stream fixes transition-RNG coupling in both directions. I found one residual issue in the seed derivation: `opponentPolicySeed` includes `ply`, but `ply` is not part of the opponent observation or callback arguments, and the core's opponent information-set key/frontier map is keyed by `seat + observationHash` without ply.

I executed the current core in a deterministic V8 harness with the same opponent observation, same `['block','pass']` frontier, same physical seat, same seed and same iteration. The only difference was a root-private world causing one extra root-seat action before reaching that opponent observation:
- threat world reached it at search ply 2 and policy RNG returned 0.910041 -> Block;
- bluff world reached it at search ply 1 and policy RNG returned 0.238958 -> Pass.

Both opponent callbacks saw exactly `{seat:1, public:{same:true}}` and the same keys. The path-length difference was determined by the root-private world; because the current policy contract is observation-only and does not pass ply, the seed has smuggled a path-dependent input into the policy. The core itself still groups these as the same information set.

Recommendation: remove `ply` from `opponentPolicySeed` and derive the policy stream from only `seed, iteration, seat, observationHash`. Repeated visits to the same information set within one iteration then get the same seeded random stream, which is preferable to hidden-world-dependent variation. If search ply is intended to be policy-visible, it must be made an explicit public observation field and included in the information-set key, not silently inserted into the RNG seed.

Please add a regression where the same opponent observation is reached at different search plies across root-private worlds. This is distinct from the transition-consumption regression and is not caught by the two tests currently added.
