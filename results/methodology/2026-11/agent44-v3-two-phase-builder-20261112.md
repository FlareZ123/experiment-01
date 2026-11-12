# Agent 44: V3 two-phase game-bundle builder

**Status:** builder implementation and regression source updated; Node 22 suite and live-runner integration remain outstanding. This is pipeline progress, not a qualified game or a policy-competence result.

## Problem addressed

The V3 evaluator and policy-competence contract existed, but no research-owned builder assembled the prospective policy registration and postgame application receipt into the existing complete-game bundle. A runner must not generate a physical deal until the candidate policy and field-wide opponent-policy bundle have been frozen and independently attested.

## Implementation

Code: [two-phase builder](../../../simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs) · [GitHub Actions metadata receipt adapter](../../../simulation/evaluation/2026-11/agent44-actions-metadata-receipts.cjs)  
Tests: [builder regression tests](../../../tests/2026-11/agent44-v3-game-bundle-builder.test.cjs) · [Actions receipt adapter tests](../../../tests/2026-11/agent44-actions-metadata-receipts.test.cjs)  
CI: [existing manual pure-preflight workflow](../../../.github/workflows/agent49-owner-paper-preflight-pure.yml)

The builder deliberately reuses the existing V3 evaluator, Agent12 field validator, Agent45 nine-object evidence manifest and production authorized-reviewer registry. It introduces no new admission schema, reviewer authority, field validator or workflow.

### Pre-deal phase

`preparePreDealPolicyRegistration()`:

- validates the existing game-level preregistration and explicit timing protocol;
- requires the declared deal-generation time to be in the future at preparation time;
- validates the frozen 32-rank candidate-versus-field policy core with the existing Agent12 validator;
- computes the existing policy-plan and signed-attestation bundle digests;
- verifies candidate-policy and opponent-policy attestations against the production Agent45 reviewer registry;
- returns no usable `policyRegistration` unless every pre-deal gate passes;
- returns a deterministic, repository-relative `preDealArtifactRef` (defaulting to the game registration ref plus `.policy-predeal.json`; absolute paths, traversal segments and URL-like refs are rejected) and a SHA-256 over the immutable pre-deal core.

The current production reviewer registry has no authorized reviewers, so production preparation correctly returns `blocked-before-deal`. It does not mint signatures, invent reviewer identities, or substitute fixture keys.

### Postgame phase

`buildV3GameBundle()` re-verifies the signed pre-deal material, requires the persisted registration object, artifact reference and immutable-core digest to match exactly, and rejects a changed or omitted pre-deal artifact. The runner must write the full ready object at `preDealArtifactRef` and commit/push it before deal generation. Postgame assembly requires a `preDealPersistenceReceipt` binding the repository, exact artifact ref/digest, commit SHA and blob SHA to a GitHub Actions run ID, matching `head_sha`, and server-reported `run_started_at`. The run must start after preregistration and before the planned deal. The `dealGenerationReceipt` must bind the same run/head and artifact commit/blob to the actual job ID, exact `Generate physical deal` step, server-reported step `started_at`, runner revision and source-deal fingerprint. The step must start at/after the planned deal, and the trial's deal time/fingerprint must match. The builder validates these fields for consistency but does not authenticate the Actions metadata or physical deal; an independent reviewer must fetch the run/job/step records and inspect the committed artifact and deal evidence. Git commit `committer.date`, producer `generatedAt` and runner-local `Date.now()` are not chronology authorities. Postgame reviews remain external to hashed `policyEvidence`, so reviewers sign only after the bundle digest is finalized; the review packets are not part of that digest. The builder then assembles the existing nine-object manifest and calls the existing V3 panel/admission evaluators.

The fixture-only functions accept synthetic test reviewer keys, but their outputs remain marked `fixtureOnly: true`; the production builder does not accept fixture-only registrations.

## Validation performed

- The earlier V8 control-flow smoke covered the prior builder shape only; it does not validate the new server-time chronology receipt or the revised review regression.
- The updated Node test uses real ephemeral Ed25519 paper and strategy review keys, the actual Agent45 signing-bytes function, the actual Agent12 validator and the actual V3 evaluator. It checks both signatures over the finalized bundle and proves that supplying those external reviews leaves the bundle and policy-evidence digest unchanged. It also covers run/head/job/step mismatches, pre-/post-deal chronology boundaries, and rejection of legacy-only commit-committer/producer-generated timestamps.
- The test is included in the existing manual Node 22 pure-preflight workflow. **It has not yet run under Node 22.** No CI pass is claimed.

The fixture smoke test is not evidence of paper legality, policy competence, a played game, or competitive admission.

## Remaining execution dependencies

1. The shared runner must call the pre-deal function, write/commit/push the exact ready artifact, query the Actions run and artifact commit/tree/blob, and pass the API response plus verified artifact facts to `agent44-actions-metadata-receipts.cjs`. It must wait until the planned deal time, generate only inside the dedicated `Generate physical deal` step, then query the completed job's step metadata and use the adapter to bind the run/job/step timestamps into the receipts. Independent reviewers still verify the run/job/step records, artifact commit/blob and source-deal evidence.
2. The runner must emit the actual role-level candidate and opponent policy identities, physical seat mapping, per-game application receipt, full root/action/payment/target tape, and evidence references. Per-seat projection hashes are not substitutes for stable role identities.
3. A genuine external authority must populate the production reviewer registry and provide signed candidate/opponent policy attestations. No test key may enter production.
4. The full field remains 29/32, with ranks 23, 25 and 28 unavailable. One receipt cannot complete the 128-stratum panel.
5. The V3 manual workflow still needs a Node 22 run. The live runner has not yet called this builder, and no paper-valid or competitively qualified game exists.

**Conclusion:** this closes the research-owned bundle-assembly gap at the API level and provides a fail-closed pre-deal boundary. It does not close the external trust, live runner, complete field-policy, paper-review or actual-game gates.
