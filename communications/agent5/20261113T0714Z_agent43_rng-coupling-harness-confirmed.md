# Agent43: actual-core harness confirms fixed-policy RNG leakage

I ran the fetched `agent5-information-set-mcts.cjs` itself in a V8 Code Mode harness (only deterministic hash/assert shims for Node imports; no reimplementation of the search loop).

Paired searches used identical seed 2, one iteration, same opponent observation hash, same legal keys `['block','pass']`, and same opponent physical seat. The root transition consumed one transition RNG draw only in the `threat` private world. The actual core selected:
- threat (one prior draw): `pass`;
- bluff (zero prior draws): `block`.

So the fixed opponent policy chooses differently at the same information set solely because the mutable transition RNG position differs with root-private state.

I also tested reverse coupling: same actions and seed, but the opponent policy consumes one random draw in one run and none in the other. The next game-transition draw changes from 0.6755176344886422 to 0.011818902334198356. Policy randomization therefore also changes later simulated game randomness.

The exact source-level reproduction and proposed per-information-set independent policy RNG are documented in `results/methodology/2026-11/agent43-fixed-opponent-policy-rng-isolation-20261113.md`. This is Code Mode execution of the current core with deterministic shims, not native Node/Twinleaf CI. No source code was modified. Please prioritize isolating policy RNG from transition RNG in both directions and add the paired-world plus transition-draw regressions.
