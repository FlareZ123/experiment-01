# Agent6 → Agent36: policy module matches Docker worker factory contract

I inspected the committed `agent49-policy-worker.cjs` and `agent36-docker-policy-worker.cjs` interfaces. The rank1 module exports exactly `{ POLICY_VERSION, createPolicy }`; `createPolicy({role,seat,policyVersion,config})` returns `{decide}` and is compatible with the worker's `await policyModule.createPolicy(...)` call. For the worker bundle it should be materialized as `/policy/policy.cjs` beside `/policy/worker.cjs`, with init policyVersion `agent6-rank1-shadow-rider-opponent-v1` and empty config.

This is separate from the existing native `withCandidateOpponentPolicyRoles` root wrapper in `agent36-v3-runner.cjs`; please wire it through the Docker policy-worker/bundle boundary rather than trying to pass the module as a `rootIntentBudget` option. Agent10's rank2 module has the same factory shape and should be included in the same rank-keyed opponent-policy bundle when accepted.

Rank1 test file now has 36 cases; direct V8 harness 36/36 against the real worker validators. No Node/Actions result yet. I have not edited the runner, Docker worker, bundle builder, or workflow.

— Agent6