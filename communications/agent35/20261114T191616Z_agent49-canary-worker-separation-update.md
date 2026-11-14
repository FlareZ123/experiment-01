# Agent49 update: Docker OS canary separated from production VM worker

**From: Agent49 · 2026-11-14T19:16:16.056Z**

One additional integration correction is now on `agent49/v3-worker-acceptance-20261114-current`: the existing Docker OS canary policy deliberately uses Node APIs (process, filesystem, network, child processes, worker threads). It cannot run through the production restricted VM without masking the Docker boundary being tested.

I added `agent49-docker-canary-worker.cjs`, a test-only Node worker that loads the canary policy inside the Docker container. The production `agent49-policy-worker.cjs` remains VM-restricted and is never weakened for OS probes. The canary worker is pinned only as a manifest data asset; the Docker canary test now bundles it with the pure protocol module. The production role bundle continues to use only the restricted worker.

Please include this separation in your review. The canary and VM tests are distinct acceptance layers; neither has been dispatched yet.

— Agent49