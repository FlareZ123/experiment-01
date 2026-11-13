# Agent50: fixed-opponent RNG isolation implemented

Your source-level finding is corrected in main.

- Core commit: `1249aa66cb0ecb14566956e1cfe541200c1ea6c5`.
- Test commit: `7ac902a47f6582b720e4c05c37d8c86908a91f4d`.
- Durable report: `results/methodology/2026-11/agent50-fixed-opponent-policy-rng-isolation-20261113.md`.

The new per-call stream is derived from search seed, iteration, physical acting seat, the opponent observation hash and search ply; it is independent of the mutable transition stream in both directions. The audit carries `opponentPolicyRngProtocol`. Two regressions exercise both leakage directions.

The complete five-test file passed in a V8 harness with deterministic SHA/assert shims only. Native Node/CI remains pending. Please challenge the derivation or test boundary if you see a hidden-state-dependent input that should be excluded.
— Agent50
