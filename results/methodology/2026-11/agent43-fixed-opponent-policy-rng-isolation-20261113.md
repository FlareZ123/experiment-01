# Fixed opponent-policy RNG must be isolated from game-transition RNG

**13 November 2026 — Agent43 source-level algorithm audit**

## Finding

The new `fixed-actor-observation-policy` mode passes the same `transitionRandom` PRNG to both:

1. root and opponent `applyAction` transitions; and
2. the opponent's observation-only policy callback.

In `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs`, each iteration creates `transitionRandom` at line 244. A root transition consumes it at the `applyAction` call around line 355. At an opponent node, the same mutable generator is passed to `opponentActionPolicy` around line 304, then is reused for the opponent's `applyAction` around line 314.

This violates the intended actor-observation-only policy contract when the number of random draws consumed by an earlier transition depends on hidden state. The opponent callback receives the same observation, legal keys, physical seat, and configured search seed, yet its random stream position can encode the root's private world. The reverse coupling also exists: random draws made by the policy advance the game-transition RNG and can change subsequent simulated shuffles/coin flips.

## Minimal deterministic counterexample

The core's exact seed mixer and xorshift generator give, for search seed **2**, iteration **0**, transition salt `0x2c1b3c6d`:

- mixed transition seed: `2075493467`;
- first random value: `0.6755176344886422`;
- second random value: `0.011818902334198356`.

Consider two root determinizations with different private card identities but the same opponent public observation and legal keys `['block','pass']`. Both execute the same public root action. In one hidden world, the root transition consumes one random draw (e.g. a hidden deck shuffle); in the other it consumes none. The opponent policy is identical and chooses `block` when its supplied random value exceeds 0.5, otherwise `pass`.

- World A (no prior transition draw): opponent receives 0.6755 and chooses Block.
- World B (one prior transition draw): opponent receives 0.0118 and chooses Pass.

The opponent's decision therefore varies with root-private hidden state even though its observation and legal frontier are identical. This is a second leakage channel, separate from the previously documented root-determinization strategy-fusion bug. It affects stochastic fixed policies; deterministic policies that ignore the supplied RNG are not exposed to this specific channel.

## Required correction

Give each opponent-policy invocation an independent deterministic PRNG derived only from public/information-set-stable inputs, such as:

- search seed;
- iteration;
- physical acting seat;
- current opponent observation hash;
- public action depth/ply.

Do not derive the policy stream from the mutable transition RNG, and do not let policy RNG consumption advance the game-transition stream. A per-information-set seed is preferable to a single per-iteration policy stream because the number of earlier opponent-policy calls can itself vary across hidden worlds.

## Regression design

Add a core test with two searches using the same seed and identical opponent observation/action keys but different root-private card identities. Make the root transition consume one transition RNG draw in only one world. A stochastic observation-only opponent policy should receive the same first policy-random value and select the same key in both worlds. Also assert that changing the number of policy RNG draws does not change the subsequent game-transition RNG sequence.

## Evidence boundary

This is a direct source-level finding from the current core implementation, with the PRNG values mathematically reproduced from its `mixSeed` and `seededRandom` algorithms. No code was changed and no Node/CI test was executed. The existing 10/10 strategy-fusion harness does not exercise this RNG-coupling case. This finding does not imply a competitive deck result; it blocks treating stochastic fixed-opponent-policy mode as information-set-isolated until the RNG streams are separated.
