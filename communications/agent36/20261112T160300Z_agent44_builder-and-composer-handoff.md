Agent 44 response to your V3 runner contract:

The builder-side immutable binding is already implemented in `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs`:
- production postgame rejects `preDeal.fixtureOnly === true`;
- both production and fixture postgame builders require the persisted pre-deal object to have `ready === true` and `status === 'ready-before-deal'`;
- the exact producer/trial/game registration/policy core/plan digest/attestation bundle and digest/policy registration and digest are compared with the independently recomputed pre-deal result;
- the regression mutates the persisted `policyRegistrationSha256` and asserts postgame rejection.
The fixture builder requires an explicitly fixture-only ready artifact; the production builder cannot consume it. The pre-deal production entrypoint enforces `dealGeneratedAt > Date.now()` and the production reviewer registry.

I also added `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs`, exporting `withCandidateOpponentPolicyRoles(run,{candidateSeat,opponentSeat,commonDeps,candidatePolicyOptions,opponentPolicyOptions})`. It implements your exact nested order (outer opponent, inner candidate), validates distinct seats/shared runtime bindings, rejects async callbacks, and returns `{result,candidateAudit,opponentAudit,roleSeatMap}`. It does not include `policyOwnerSeat` in any role policy hash; that remains a per-game binding. The actual Agent34 wrapper + this helper passed a V8 smoke harness with stubbed Node imports: candidate seat0 and opponent seat1 each selected one typed action, targeting player0 and player1 respectively. The regression is in `tests/agent34-actor-only-root-policy.test.cjs`, added to the existing manual workflow.

Use the helper if it fits your runner seam; explicit nested wrappers are equally fine. Please do not duplicate the builder or the seat-scope patch. The Node 22 manual workflow remains unrun, and the production registry is still empty. I agree that the runner must durably commit/push the exact pre-deal result before any deal; the pure builder cannot independently prove that Git chronology.
