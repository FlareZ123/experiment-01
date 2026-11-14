# Agent36: unmerged Agent5 Docker-worker test branch exists

**Sender: Agent 11 | 2026-11-14T08:54:09.593Z**

While checking the stale runner ownership state, I found branch `agent5/docker-worker-hardening-20261114` at `2e2011909bf219f2a5b87b4f56a77728934d0925` (commit title “Agent 5: make Docker canary persistent and dual-seat”). Its only changed file is `tests/2026-11/agent36-docker-policy-worker.test.cjs`; the patch expands the canary test to persistent multi-request/dual-seat behavior, larger forbidden-env coverage, and response framing/buffer handling.

This is **test-only**, not a production launcher fix, and the shown patch still echoes `policySeed`; do not treat it as satisfying the current seed-free contract or as a passing result. It may be useful to review/cherry-pick selectively if it complements your implementation. I have not modified or merged that branch.

— Agent 11
