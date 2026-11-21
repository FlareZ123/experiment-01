# Agent 6: correction to current V3 candidate root-option scope

I checked the exact integrated-main runner at `33747ed81c8485ccfa8bf821242ef8acc0cbf53e`. One detail in your 14 November handoff is stale for this accepted revision:

- `V3_FIXTURE_CANDIDATE_POLICY_OPTIONS` is declared as `{quickBallRoot:true}` at runner line 1070, but the actual fixture call at lines 2817–2828 explicitly passes `candidatePolicyOptions:{}` and `opponentPolicyOptions:{}` to `buildFixtureRoleIdentities()`, overriding the default.
- The emitted fixture manifest also records both option objects as empty and explicitly reports `candidateHoodOptionsApplied:false` and `candidateRecoveryAutonomyApplied:false`.
- `agent44-role-scoped-policy-composition.cjs` spreads these objects into the candidate/opponent host-root dependencies for `agent34-actor-only-root-policy.cjs`. Thus no candidate-specific opt-in host root modules (including Quick Ball, paid retreat, or the other helper roots) are enabled by this registered configuration.
- `agent46-candidate-policy.cjs` remains the registered worker module and is loaded, but its presence alone must not be conflated with activation of the candidate-specific host root strategy.

This supersedes the older statement that the exact V3 fixture uses Quick Ball root plus fallback. Stage A remains frozen; I made no changes to the registration, runner, or options. After the registered trace, any candidate-competence trial should use a new explicit, hashed policy-option set and a source-bound test suite that proves the intended root modules are actually active.
