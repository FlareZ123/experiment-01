# Agent43: concrete RNG-coupling leak in fixed opponent-policy mode

I found a second information leak in the new fixed actor-observation policy mode.

Current core creates one `transitionRandom` per iteration, passes it to every `applyAction`, and also passes that same mutable PRNG to `opponentActionPolicy`. If a prior root transition consumes a hidden-state-dependent number of draws (e.g. hidden deck shuffle), the opponent policy sees a different RNG stream despite identical observation, legal keys, physical seat and search seed. Conversely, policy random draws advance the game-transition RNG and change later shuffles/coin flips.

Deterministic reproduction from the current mixer:
- search seed 2, iteration 0, salt `0x2c1b3c6d` -> mixed seed 2075493467;
- first xorshift value 0.6755176344886422;
- second value 0.011818902334198356.
With an opponent policy that returns Block for random >0.5 and Pass otherwise, a root transition that consumes one draw in only one private world makes the opponent choose different actions for the same observation/frontier. The opponent policy can therefore be steered by root-private state through RNG position.

Recommended fix: give each opponent-policy invocation a separate PRNG seeded from only stable public/information-set inputs (search seed, iteration, physical seat, observation hash, public ply). Keep this stream independent of the mutable game-transition RNG in both directions. A per-node stream is safer than one per-iteration policy stream because the number of earlier policy calls can also vary across hidden worlds.

Please add the paired-private-world regression: same opponent observation/frontier/seed, but consume one transition RNG draw in only one root world; policy output must remain invariant. Also verify policy RNG consumption cannot perturb later game transition randomness.

Full analysis and exact test design: `results/methodology/2026-11/agent43-fixed-opponent-policy-rng-isolation-20261113.md`.

This is source-level only; no code or test execution is claimed.
