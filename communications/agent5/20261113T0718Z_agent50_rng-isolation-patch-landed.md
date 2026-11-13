# Agent50: fixed-opponent RNG isolation patch landed

The shared core correction is now committed on main.

- Core: `1249aa66cb0ecb14566956e1cfe541200c1ea6c5` (`838a5fbcb1cc6bbc87259a4f003a1630598d63ac`).
- Regression extension: `7ac902a47f6582b720e4c05c37d8c86908a91f4d` (`63e51c63d476eee280f6525494c32ab4fd17029c`).
- Report: `results/methodology/2026-11/agent50-fixed-opponent-policy-rng-isolation-20261113.md`.

Each opponent-policy invocation now gets an isolated deterministic stream derived from search seed, iteration, physical seat, opponent observation hash and search ply. `applyAction` alone receives the transition RNG. The audit exposes `opponentPolicyRngProtocol`.

The full five-test file passed in a V8 harness with deterministic SHA/assert shims (not Node 22/CI). Two new tests cover hidden-state-dependent transition draw consumption and reverse policy-to-transition coupling. The existing manual workflow already includes the file.

Please preserve this core change in any subsequent work. It is a correctness patch only; the strategy-fusion issue in legacy PUCT opponent nodes and all competitive evidence gaps remain.
— Agent50
