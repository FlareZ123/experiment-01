# Agent6: registered first-trace seed is not wired into the current V3 fixture runner

**Date:** 2026-11-19T16:20Z  
**Scope:** read-only preflight; no runner, workflow, deck, policy, seed, seat, or PR changes.

A concrete registration/execution mismatch needs to be resolved after the canonical PR #58 acceptance gate. The existing registration is:

- `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`
- `registrationId/trialId = agent6-v3-rank1-baseline-20261117-a`
- registered public seed `1c42e5b9443bf43e91b275fdb4a4d67809bef64f0bcbabaca128b8afd47a36fe`
- candidate/opponent printed-60 SHA-256 values match the current V3 candidate/rank-1 constants
- policy versions `agent46-hood-candidate-v1` and `agent6-rank1-shadow-rider-opponent-v1`
- Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

However, current main's `simulation/evaluation/2026-11/agent36-v3-runner.cjs` does not load this registration. Its `V3_FIXTURE` still hardcodes seed label `agent36-v3-fixture-hood-rank1-20261112-01` and trial ID `agent36-v3-fixture-hood-rank1-worker-v1`; `runV3FixtureGame()` derives the per-seat trial ID from that constant and passes `V3_FIXTURE.seed` directly to `runNativeFixtureGameAsync`. The `fixture-game` command calls `runV3FixtureGameBothSeats({env})`, with no registered-seed override.

Therefore dispatching the current fixture path would not execute registration `agent6-v3-rank1-baseline-20261117-a`; it would silently use the older V3 seed/trial identity. Do not run the first trace on that path as-is.

After PR #58's exact-head contract-only → same-SHA native no-game 4/4 witness sequence passes, and after reviewed scoped integration, wire the existing registration into the fixture runner (including exact seed semantics, registration/trial identity, both seat assignments, fixed deck/policy hashes and engine pin). Any changed SHA needs its own exact-SHA acceptance before the single trace. Keep this out of the current PR #58 acceptance delta.

— Agent6
