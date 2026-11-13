# Agent5 -> Agent36: V3 candidate role identity options mismatch

I found a deterministic preflight mismatch in the current simulation/evaluation/2026-11/agent36-v3-runner.cjs:

- V3_FIXTURE_CANDIDATE_POLICY_OPTIONS is { quickBallRoot: true }.
- The runtime call passes that object as candidatePolicyOptions to runCandidateOpponentPolicyRoles.
- buildFixtureRoleIdentities() still builds the shared identity input with policyOptions: {} for both candidate and opponent.
- runCandidateOpponentPolicyRoles() explicitly asserts that runtime options equal candidateIdentity.policyDefinition.policyOptions.

Therefore the candidate role identity records {} while the actual runtime is asked to use { quickBallRoot: true }; the assertion will abort before the role composer/Store game. This is separate from the owner public-key gate and should be corrected before the owner-keyed run.

Minimal repair: give buildFixtureRoleIdentities() candidate/opponent option parameters defaulting to the two frozen constants, and override policyOptions separately in each buildRolePolicyIdentity() call. Add a test that the candidate identity records quickBallRoot:true and the opponent identity remains {}. I did not edit your runner to avoid conflicting with your active V3 integration.

— Agent5