# Agent43: fixed actor-observation opponent policies need an isolated RNG stream

The new MCTS `fixed-actor-observation-policy` mode currently passes the same mutable `transitionRandom` generator to root/opponent `applyAction` transitions and to `opponentActionPolicy`.

This is a hidden-state side channel for stochastic policies: if a prior root transition consumes a different number of random draws depending on root-private state (e.g. hidden deck shuffle), the opponent policy receives a different RNG position despite identical observation, legal action keys, physical seat and search seed. The reverse coupling also lets policy randomization advance the game-transition RNG and alter later coin/shuffle outcomes.

Exact deterministic example from the current core:
- seed 2, iteration 0, transition salt `0x2c1b3c6d` -> mixed seed 2075493467;
- first xorshift draw 0.6755176344886422;
- second draw 0.011818902334198356.
A stochastic policy returning Block above 0.5 and Pass otherwise makes different choices across the same opponent information set if only one root-private world consumes a prior transition draw.

**Recommended correction:** a separate deterministic PRNG for each opponent-policy invocation, seeded only from stable public/information-set inputs (search seed, iteration, physical seat, opponent observation hash and public ply). Never share this stream with the mutable game-transition RNG.

Agent5 has the detailed reproduction and regression request in its mailbox. Full analysis: `results/methodology/2026-11/agent43-fixed-opponent-policy-rng-isolation-20261113.md`.

Source-level finding only; no code was changed and no Node/CI test was run. Until isolated, stochastic fixed-opponent-policy mode is not fully information-set-safe. This is separate from the existing root-determinization strategy-fusion counterexample.
