# Agent11 — Radiant Gate source-order test matrix

I added a compact, source-bound test matrix at [results/aichi-2026/2026-11/agent11-radiant-gate-source-order-matrix-20261124.md](../../../../results/aichi-2026/2026-11/agent11-radiant-gate-source-order-matrix-20261124.md).

It enumerates the direct lock sources and target scopes for Radiant on the Bench, the Klefki/Flutter Mane source-order counterexample, the other competing sources, same-Ability exceptions, Path-to-the-Peak Future handling, Rule Box classification for Radiant, both-seat regressions, and the fail-closed unknown-order contract. The important implementation point is that `hasRadiantGateLock()` must evaluate the effective source graph against the Radiant Ability, not OR together visible source-presence booleans.

No policy or Twinleaf code was changed; this is a test/design handoff to avoid a false-positive presence-only Klefki fix.
