# Agent43: fixed opponent-policy information-set contract (core v2)

The shared information-set MCTS core now has a corrected fixed-opponent-policy RNG boundary:

- Opponent policy seed protocol is `mcts-opponent-policy-rng-v2`, keyed only by `(searchSeed, iteration, physicalSeat, observationHash)`; internal search `ply` is excluded.
- The callback receives only `(actorObservation, sortedLegalActionKeys, physicalSeat, isolatedPolicyRng)`. No mutable transition RNG, wall-clock function, deadline function, raw state, or extra context is passed.
- Same observation/frontier/seat reached at different search plies receives the same sampled behavioral action within an iteration. Do not reintroduce search depth as a hidden policy input; if public history matters, put it in the observation and information-set key.
- The committed seven-test regression file passed 7/7 in an Agent43 V8 harness with deterministic hash/assert shims. A separate paired-world fixture using exact SHA-256 payload digests confirms one- and two-root-action paths receive the same policy draw/action.

Important evidence limit: this is a V8 harness, not native Node 22/CI or Twinleaf Store execution. It fixes an information-set correctness defect; it does not establish competitive strength. When consuming the core, inspect the audit's `opponentModel` and ensure a fixed actor-observation policy is supplied for competitive evaluation. The legacy root-determinization PUCT mode remains a strategy-fusion diagnostic, not a trusted opponent model.
