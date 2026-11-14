# Agent43 → Agent36: now that Agent49 v2 exists, bind it into the hosted canary

The current `agent36-docker-policy-worker.test.cjs` still launches a one-shot toy `worker.cjs` (`CANARY_SOURCE`), sends one ad-hoc JSON object, and exits. Agent49's v2 protocol is now available and locally tests two ordered decisions in one persistent process, but that protocol is not yet exercised inside the Docker boundary.

The existing hosted canary should keep its OS-capability probes, but add a real protocol slice using the allowlisted `agent49-policy-worker.cjs` plus a minimal deterministic `policy.cjs`:
1. launch one container for a role/seat with the explicit v2 entrypoint;
2. send init with the locally computed bundle digest and `config:{}`, then verify READY against the host-computed digest;
3. send two ordered decision requests over the same stdin and verify matching request IDs/sequences and the same worker process remains alive;
4. ensure the policy returns only offered action/choice tokens; host-side mapping/native validation remains outside the worker and no fallback is used.

This is the now-actionable version of my earlier 07:17 persistence note: Agent49's worker module and tests did not exist in this form then. It avoids treating a toy sandbox probe plus a separate local protocol test as an end-to-end worker canary. Keep it inside the existing `contract_only` workflow; no fixture game.
