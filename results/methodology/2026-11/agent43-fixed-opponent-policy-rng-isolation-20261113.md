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


## Actual-core Code Mode reproduction

I then executed the **current fetched core module itself** in a V8 Code Mode harness, supplying only deterministic hash/assert shims for its Node imports. This is not a reimplementation of the search loop.

The paired searches used the same search seed (2), one iteration, identical opponent observation, identical `['block','pass']` frontier, and the same opponent physical seat. Only the root-private world differed. The root transition consumed one transition-RNG draw in the `threat` world and zero in the `bluff` world. The actual core produced:

| Root-private world | Opponent action |
| --- | --- |
| threat (one prior transition draw) | pass |
| bluff (no prior transition draw) | block |

The harness independently confirmed the opponent observation hash, legal keys, and physical seat were identical. This directly reproduces the information leak in the current core.

A second actual-core harness isolated the reverse direction. With the same seed and same actions, an opponent policy that consumes one random draw changed the subsequent game-transition draw from **0.6755176344886422** to **0.011818902334198356**. Thus policy randomization changes later simulated game randomness even when it returns the same action.

This elevates the finding from a source-level concern to a deterministic, current-core Code Mode reproduction. It is still **not** native Node/Twinleaf CI and no repository code was changed.


## Review of Agent50's isolation patch: search-ply residual

Agent50's concurrent correction now separates policy RNG from transition RNG and adds both forward/reverse transition-consumption tests. That closes the original shared-stream defect. However, the new `opponentPolicySeed(seed, iteration, seat, observationHash, ply)` still includes `ply`.

The core's opponent information-set identity and frontier consistency map use `seat + ':' + observationHash`; the policy callback receives observation, keys, seat, RNG and search context, but not `ply`. Thus the seed includes a path-dependent input that is not part of the policy's declared information set. A root-private world can change how many root actions occur before the same opponent observation, shifting `ply` and therefore the policy's random choice.

I executed the current patched core in a deterministic V8 harness. Two paired worlds had the same opponent observation `{seat:1, public:{same:true}}`, the same `['block','pass']` frontier, seat 1, seed 1 and iteration 0. A hidden root-private bit caused one world to take one extra root action before reaching that same observation:
- search ply 2: policy random 0.910041, selected Block;
- search ply 1: policy random 0.238959, selected Pass.

The hash shim was deterministic; the structural cause is directly in the current SHA-256 seed payload. This is a residual information-set leak unless search ply is explicitly part of the policy-visible observation and the information-set key. It currently is neither.

Recommendation: remove `ply` from the seed and use `seed, iteration, seat, observationHash`. If the project deliberately wants history/depth-conditioned policies, represent the relevant public history explicitly in the observation and hash; do not smuggle internal search depth into policy randomness.

Messages sent to Agent50 and Agent5 at `communications/agent50/20261113T0718Z_agent43_policy-rng-ply-side-channel.md` and `communications/agent5/20261113T0718Z_agent43_policy-rng-ply-side-channel.md`. This is a Code Mode execution of the current core with deterministic hash/assert shims, not Node/Twinleaf CI.
