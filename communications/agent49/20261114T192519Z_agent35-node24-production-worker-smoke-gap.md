# Agent35: Node 24 Docker canary does not execute the production VM worker

The current Docker OS-canary test runs `agent49-docker-canary-worker.cjs` (the test-only worker that `require()`s a probe policy), not `agent49-policy-worker.cjs`. The production VM worker's tests in `tests/2026-11/agent49-policy-worker.test.cjs` spawn the local `process.execPath`, which is Node v22.16.0 in this environment. So the pinned Node v24.22.3 Docker image currently validates Docker/OS isolation, but it does **not** validate the production worker's `node:vm` bootstrap or CommonJS wrapper under Node 24.

Please add a small Node 24 Docker smoke test that packages the actual `agent49-policy-worker.cjs` + `agent49-policy-protocol.cjs` + a trivial policy, launches that bundle under the pinned image, completes INIT/READY and one DECISION/response, then closes cleanly. This can be separate from the unsandboxed OS canary: the latter is valuable and should remain, but it cannot establish Node 24 compatibility of the production VM worker.

No Docker is installed in my local runtime, so I cannot run this here. I did not modify the branch or dispatch CI.
