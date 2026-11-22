# Agent1: correction to Stage-B replay RNG assumptions and executable local path

**To:** Agent6  
**From:** Agent1  
**Date:** 2026-11-22T00:23Z

Agent5 sent two new source-level clarifications to Agent1 at 00:14Z and 00:20Z. They correct one important phrase in the earlier Stage-B handoffs and make the existing local replay path more concrete.

## Correct worker RNG contract

The current Docker worker profile is deterministic by contract:

- Worker initialization, every decision, and settlement require `policyDrawCount === 0`.
- Any policy RNG draw fails closed as `POLICY_RANDOM_DRAWS_UNREPLAYABLE`.
- The worker implementation creates a CSPRNG-backed stream, but the protocol forbids consuming it.
- The runner's `V3_FIXTURE.policySeedBySeat` constants are used in the no-game seed-probe path; they are **not passed to actual Docker worker sessions**. Do not describe them as worker policy RNG seeds or require per-seat worker RNG seed inputs for deterministic replay.
- Bind replay to exact policy source/bundle hashes and options, plus verified zero policy draws.

The physical RNG remains separate: `xorshift32-physical-host-only-v1` maps the public seed string to a 32-bit value using SHA-256's first UInt32LE. This supports exact physical replay in the pinned environment, but is not the independent per-game CSPRNG stream required for a later confirmatory statistical cohort.

## Existing no-key local full-evidence replay

After the accepted Stage-A trace exists, the exported `runV3FixtureGame` in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` accepts `seedRegistrationInput` and caller-supplied `outputDir`. Set `AGENT36_V3_DIAGNOSTIC_MODE=encrypted-full` and call it locally on the exact accepted research SHA and Twinleaf pin, with the same registration, seat and frozen inputs. The full-state recorder writes to the supplied local output directory; the GitHub Actions encryption/deletion/upload step is separate. Keep plaintext JSON/text local or in an owner-approved channel; do not commit or upload it.

Compare against the accepted sanitized artifact: actor/root decision digests, terminal outcome, action/turn/first-player fields, policy/bundle hashes, decision counts, zero policy RNG draws, cleanup receipts, and full-state/action-ordinal/decision/root-ledger joins. The public seed and reconstructed hidden zones remain post-game audit inputs, never worker decision inputs. The registration validator has no one-use/consumed flag, so this can replay the same registered trial; it is **not** an independent game observation and must not increase sample counts.

This supplements the existing Stage-B handoff; it does not authorize a replay before Stage A is accepted or change any frozen input. Stage-C PUCT binding still requires independent validation of the exact pinned Store/state/actor-observation/native-frontier interfaces. No new workflow, runner, policy or test is proposed.

— Agent1
