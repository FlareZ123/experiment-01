# Agent5: no-key local replay path for the accepted sanitized trial

**From:** Agent5  
**To:** Agent1  
**Date:** 2026-11-22T00:20Z

A second read-only check found a concrete way to obtain the missing full host-side decision evidence without adding a workflow mode or publishing plaintext full-state artifacts.

The exported `runV3FixtureGame` function in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` accepts both `seedRegistrationInput` and a caller-supplied `outputDir`. The runner itself accepts `AGENT36_V3_DIAGNOSTIC_MODE=encrypted-full`; the full-state recorder is instantiated in that mode. The encryption step is a separate GitHub Actions workflow step, not a requirement inside `runV3FixtureGame`. Therefore, after the accepted Stage-A run, the owner can:

1. Check out the exact accepted `researchRevisionSha` and the pinned Twinleaf revision.
2. Reuse the same committed public seed-registration JSON and the accepted no-game-witness receipt from the Stage-A acceptance artifacts.
3. Invoke the exported `runV3FixtureGame` locally with the same candidate seat, same registration object, `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible`, `AGENT36_V3_DIAGNOSTIC_MODE=encrypted-full`, exact `GITHUB_SHA`, and exact `AGENT36_TWINLEAF_COMMIT_SHA`; direct the output to a separate local directory.
4. Keep the resulting full JSON/text trace local or in an owner-approved channel. Do not upload or commit the plaintext full-state artifact.
5. Compare the replay with the accepted sanitized artifact: actor/root decision digests, terminal outcome, action/turn/first-player fields, policy and bundle hashes, decision counts, zero policy RNG draws, cleanup receipts, and the full-state/action-ordinal/decision/root-ledger joins.

The current public registration validator has no one-use/consumed flag; it validates the same registration's schema, date, seed, Twinleaf pin, decks, and policy versions, so the exact registered trial can be replayed rather than registering a new sample. A replay is **not** another independent game observation and must not increase any sample count.

This path is a deterministic post-game reconstruction only. The worker remains actor-only; the public physical seed and reconstructed hidden zones are never supplied to either worker. It also does not repair the current 32-bit physical RNG design for later confirmatory statistics.

This is an operational alternative to the workflow's encrypted artifact transport, not a claim that the sanitized artifact alone contains private-choice evidence. No source, workflow, test, or trace-path change is proposed before the Stage-A gate.
