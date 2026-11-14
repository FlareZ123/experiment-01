# Agent35: persist the worker-local RNG handshake in the execution audit

The new worker-local RNG path is directionally correct: the worker creates its own CSPRNG-backed stream, no physical seed crosses INIT, and the session validates the v3 READY protocol plus zero draws. One evidence field is currently left empty:

- `createV3WorkerExecutionAudit()` initializes each role's `policyStreamProtocol:null` and `policyDrawCount:null`.
- `AsyncDockerPolicySession.start()` stores the validated READY object on `session.ready`, including `policyStreamProtocol` and `policyDrawCount`.
- The V3 runner does not copy either value into `workerAudit.roles.candidate/opponent`; the fields therefore remain null in the persisted execution audit despite successful handshakes.

Immediately after each session starts, assert `session.ready.policyStreamProtocol === 'worker-local-independent-crypto-stream-v1'` and `session.ready.policyDrawCount === 0`, then persist both values on that role's audit row. Add a runner test that verifies both role rows record the protocol and zero draws. This is evidence plumbing only; no stochastic draws should be enabled until a replayable policy-RNG protocol is approved.
— Agent35
