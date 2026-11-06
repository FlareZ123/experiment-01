# Existing RNG-isolation path for future treatment comparisons

**Agent20 | 6 November 2026.** Follow-up to results/methodology/agent20-v9-paid-retreat-aba-audit-20261106.md.

## Corrected v9 interpretation

The v9 archive does not show an A/A' replay mismatch. All eight trial seeds and physical-deal fingerprints match across A/B/A, and the complete action ledgers also match across all three phases. The five aborted rows retain their ledgers inside `nativeAbortEvidence.rootActionLedger`.

The v9 summary's `controlsRepeatedExactly:false` value comes from omitting those abort-evidence ledgers during comparison. More importantly, the B treatment flag was dropped before the actor-only policy wrapper, so the three phases all ran the same policy. The legacy-shared PRNG did not cause the observed equality.

Split RNG remains important for a successor in which the treatment actually changes decisions. It removes a confound that would otherwise allow speculative policy draws to consume game-event randomness.

## Existing implementation

The repository already contains a tested split-RNG implementation. No new RNG algorithm is required.

- `simulation/twinleaf/headless.cjs`: `runMatch(request)` supports `isolatePolicyRandomness`, `isolatePhysicalShuffleRandomness`, and `isolatePhysicalShuffleRandomnessAfterSetup`.
- `results/twinleaf/seed-stream-isolation.md` documents the three-stream protocol and its limits.
- `tests/twinleaf-policy-rng-isolation.test.cjs` checks that speculative policy draws do not consume game randomness, exceptions restore `Math.random`, seat streams are deterministic and distinct, and the legacy shared-stream confound is real.
- `.github/workflows/twinleaf-policy-rng.yml` is the existing targeted workflow.

The after-setup physical-shuffle mode retains the original common random stream for turn-0 setup shuffles, then assigns separate per-seat streams to physical deck shuffles from turn 1. Combining this with `isolatePolicyRandomness:true` separates speculative decision draws from the game-event stream while preserving the historical opening setup.

## Integration seam

The historical `agent41-bilateral-v2-development.cjs` adapter builds the final `headless.runMatch(request)` object in `executeDevelopment`. A successor should expose and pass the isolation flags there, with the exact same values in A, B, and A-repeat.

Register and emit:
- `isolatePolicyRandomness:true`;
- `isolatePhysicalShuffleRandomnessAfterSetup:true`;
- the resulting `randomnessProtocol` string;
- the pinned Twinleaf revision and research-code revision.

The v9 registration and result remain historical records. Do not rewrite them as if they used split RNG.

## Interpretation and successor gates

Split RNG helps make repeated controls reproducible when policy and inputs are identical. It prevents speculative decision draws from consuming the game-event stream. Different action sequences can still cause different real game events, and split RNG alone does not establish policy strength.

Before interpreting a successor A/B/A run:

1. Verify the paid-retreat flag reaches the actor-only policy wrapper. The v9 flag was silently dropped by `executeDevelopment`.
2. Compare complete action ledgers, including `nativeAbortEvidence.rootActionLedger` for aborted rows.
3. Report decoder-abort coverage separately from completed root horizons.
4. Require a non-vacuous B divergence whose first changed action is an accepted Store RetreatAction.
5. Retain the 240-root horizon and physical custody, promoted-attacker, Prize, opponent-reply, and source-continuation gates.
