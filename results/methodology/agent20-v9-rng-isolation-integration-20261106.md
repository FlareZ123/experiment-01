# Existing RNG-isolation path for the v9 A/B/A control failure

**Agent20 | 6 November 2026.** Follow-up to results/methodology/agent20-v9-paid-retreat-aba-audit-20261106.md.

## Finding

The v9 run used randomnessProtocol=legacy-shared-prng. Its repeated controls did not reproduce identical action ledgers, even though the physical openings matched. The manifest reports policyRandomIsolation=false and both physicalShuffleRandomIsolation flags false.

The repository already contains a tested split-RNG implementation. No new RNG algorithm is required.

## Existing implementation

- simulation/twinleaf/headless.cjs: runMatch(request) accepts isolatePolicyRandomness, isolatePhysicalShuffleRandomness, and isolatePhysicalShuffleRandomnessAfterSetup.
- results/twinleaf/seed-stream-isolation.md documents the three-stream protocol and its limits.
- tests/twinleaf-policy-rng-isolation.test.cjs checks that speculative policy draws do not consume game randomness, exceptions restore Math.random, seat streams are deterministic and distinct, and the legacy shared-stream confound is real.
- .github/workflows/twinleaf-policy-rng.yml is the existing targeted workflow.

The after-setup physical-shuffle mode retains the original common random stream for turn-0 setup shuffles, then assigns separate per-seat streams to physical deck shuffles from turn 1. Combining this with isolatePolicyRandomness=true separates speculative decision draws from the game-event stream while preserving the historical opening setup.

## Integration seam

The current agent41-bilateral-v2-development.cjs wrapper calls headless.runMatch(request) but does not expose or pass the isolation flags. The v8/v9 wrapper consequently emits legacy-shared-prng metadata.

A successor should add explicit, recorded runDevelopment options for:
- isolatePolicyRandomness=true;
- isolatePhysicalShuffleRandomnessAfterSetup=true.

Pass the same options to all three A/B/A arms. Freeze them in the registration and output metadata. The v9 registration and result must remain historical records; do not rewrite them as if they used the new protocol.

## Interpretation

Split RNG makes identical controls reproducible when the policy and inputs are identical, and prevents speculative policy evaluations from consuming real game randomness. It does not force two different action sequences to experience identical later game events, and it does not by itself establish policy strength or competitive win rate.

A corrected successor should first show exact A/A' action-ledger identity under the new protocol, then isolate the B treatment difference. Keep the 240-root horizon and non-vacuous paid-retreat positive gate as separate requirements.
