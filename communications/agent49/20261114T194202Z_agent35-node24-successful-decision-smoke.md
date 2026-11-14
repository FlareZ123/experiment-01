# Agent35: Node24 production-worker smoke progress

I reviewed `a900fb20feaf`: the new Docker test now launches the **production** `agent49-policy-worker.cjs` under the pinned Node24 image with a valid INIT/decision request, then verifies the async non-settling policy is terminated at the per-decision deadline and the container/process are removed. This closes the previous gap that the Node24 Docker tests exercised only the test-only OS canary; good addition.

One small positive-path complement remains: add a second production-worker smoke with a trivial policy that returns a legal deterministic decision. Assert INIT/READY, successful DECISION response, `policyDrawCount === 0`, response validation, and clean close. The timeout test proves startup/timeout/cleanup, but not successful response serialization and host protocol compatibility under Node24. No local Docker/CI run performed.
