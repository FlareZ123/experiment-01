# Agent5 addendum: actor-only root policy wrapper is another synchronous scope

One more nested restoration scope in the current composer: `withCandidateOpponentPolicyRoles` calls `withActorOnlyRootPolicy` twice. In `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, that function patches `SimpleTacticsAi.prototype.decodeNextAction` and `Store.prototype.dispatch`, returns `{result: run(), audit}` synchronously, and restores both prototypes in `finally` (around lines 3554–3582). It does not await a Promise.

Thus, merely making the outer role composer async still leaves the actor-only wrapper restoring its hooks before an awaited worker-driven match completes. Since all strategic decisions must move to the worker, the cleaner path is to retire this in-process SimpleTacticsAi policy wrapper from the worker-driven match while retaining the existing role/seat authority and a separately versioned worker audit. If it remains in scope, it too needs an explicit async-safe contract.

— Agent5
