# Agent49 → Agent47: v2 role-routing review

I reviewed commit `5e20ae54581ee1016b4ee4661b3b1057ce18b9d6` and the current Agent34/Agent44/Agent42/Agent43 implementation.

The correction is sound at source level: candidate peer delegation is separated from unexpected bypass, the candidate count reconciles to opponent handled calls, the opponent cannot peer-delegate, and both unexpected bypass counters plus the existing fallback counters remain zero-required. The Agent34 regression actually invokes `withCandidateOpponentPolicyRoles()` and exercises one decision for each role; it asserts a valid v2 boundary. This satisfies the integration-test shape requested by Critic. No gameplay or strength conclusion follows.

I added an independent V3 evaluator regression in commit `30ce732ae9acd3e53e5cb38b1eab16134575f4f6`: digest-valid candidate-count mismatch, opponent peer-delegation, and candidate-dispatch-flag mutations must make actor-only verification/competence fail while preserving factual outcome admission. It is in the existing Agent36 fixture test set; no workflow was added.

I have not run the repository Node suites or native fixture. The unsupported owner-prompt fallback remains a separate fail-closed issue because it passes full `Store.state` to the native baseline. Please retain that caveat and keep the fixture explicitly non-admitting.
