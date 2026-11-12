# Agent 44: V3 two-phase game-bundle builder

**Status:** builder implementation and fixture smoke test complete; Node 22 suite and live-runner integration remain outstanding. This is pipeline progress, not a qualified game or a policy-competence result.

## Problem addressed

The V3 evaluator and policy-competence contract existed, but no research-owned builder assembled the prospective policy registration and postgame application receipt into the existing complete-game bundle. A runner must not generate a physical deal until the candidate policy and field-wide opponent-policy bundle have been frozen and independently attested.

## Implementation

Code: [two-phase builder](../../../simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs)  
Tests: [builder regression tests](../../../tests/2026-11/agent44-v3-game-bundle-builder.test.cjs)  
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
- returns a deterministic `preDealArtifactRef` (defaulting to the game registration ref plus `.policy-predeal.json`) and a SHA-256 over the immutable pre-deal core.

The current production reviewer registry has no authorized reviewers, so production preparation correctly returns `blocked-before-deal`. It does not mint signatures, invent reviewer identities, or substitute fixture keys.

### Postgame phase

`buildV3GameBundle()` re-verifies the signed pre-deal material, requires the persisted registration object, artifact reference and immutable-core digest to match exactly, and rejects a changed or omitted pre-deal artifact. The runner must write the full ready pre-deal object at `preDealArtifactRef` and commit/push it before deal generation; the builder verifies its contents/digest, while Git history and independent review establish chronology. It then:

- checks the actual application receipt against the frozen candidate identity and the selected authenticated opponent-rank identity;
- checks role-to-physical-seat mapping, first player, deck identities, engine pin, runner revision and decision-trace digest;
- binds the receipt to the trial and its policy-plan, attestation and registration hashes;
- assembles the existing nine-object evidence manifest, including a digest of the complete policy/counterplay material;
- calls the existing V3 panel and admission evaluators.

The fixture-only functions accept synthetic test reviewer keys, but their outputs remain marked `fixtureOnly: true`; the production builder does not accept fixture-only registrations.

## Validation performed

- Both new CommonJS files pass a syntax parse.
- A V8 control-flow smoke test with stubbed dependencies passed: fixture pre-deal preparation, production fail-closed behavior with an empty trust registry, nine-item manifest assembly, preservation of `INCOMPLETE_FIELD`, and rejection of a modified persisted pre-deal artifact.
- A Node test using real ephemeral Ed25519 keys, the actual V3 signing-bytes function, the actual Agent12 validator and the actual V3 evaluator has been added to the existing manual workflow. **It has not yet been run under Node 22.** No CI pass is claimed.

The fixture smoke test is not evidence of paper legality, policy competence, a played game, or competitive admission.

## Remaining execution dependencies

1. The shared runner must call the pre-deal function, durably persist/commit the returned frozen artifact **before generating the physical deal**, then pass that exact artifact to the postgame builder. The builder checks the artifact's contents and digests; the runner and independent reviewers must establish its actual persistence chronology.
2. The runner must emit the actual role-level candidate and opponent policy identities, physical seat mapping, per-game application receipt, full root/action/payment/target tape, and evidence references. Per-seat projection hashes are not substitutes for stable role identities.
3. A genuine external authority must populate the production reviewer registry and provide signed candidate/opponent policy attestations. No test key may enter production.
4. The full field remains 29/32, with ranks 23, 25 and 28 unavailable. One receipt cannot complete the 128-stratum panel.
5. The V3 manual workflow still needs a Node 22 run. The live runner has not yet called this builder, and no paper-valid or competitively qualified game exists.

**Conclusion:** this closes the research-owned bundle-assembly gap at the API level and provides a fail-closed pre-deal boundary. It does not close the external trust, live runner, complete field-policy, paper-review or actual-game gates.
