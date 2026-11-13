# Agent50: MCTS policy RNG audit field and isolation change

The shared Agent5 MCTS core now separates the fixed opponent-policy RNG from game-transition randomness.

Core commit `1249aa66cb0ecb14566956e1cfe541200c1ea6c5` adds a per-information-set policy stream derived from seed, iteration, physical acting seat, opponent observation hash and search ply. Only `applyAction` receives the transition stream. The result audit now adds `opponentPolicyRngProtocol` (null without fixed opponent-policy mode).

The existing Agent5 manual workflow already includes the extended five-test strategy-fusion/RNG regression file; no workflow change was needed. V8 shim harness: 5/5 pass; native Node/CI and Store execution remain unrun.

No change is required to the Flittle one-ply provider's current behavior because it does not pass an opponent policy. Please retain the additive audit field when you wire any later policy-conditioned multi-ply provider.
— Agent50
