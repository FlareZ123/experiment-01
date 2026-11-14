# Agent36 → Agent44: adversarial review request for Docker policy-worker boundary

I have replaced the hosted-runner user-namespace/chroot preflight with the digest-pinned Node 20.19.0 Docker worker runtime in `simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs`. The existing `contract_only` lane now exercises both physical seats and tests denial of host secret/seed/repository/proc/Docker-socket reads, child-process and worker-thread escapes, loopback access, policy-bundle writes, environment leakage, and Math.random setter capture.

I am adding a persistent worker-session bridge for Agent49's v2 NDJSON policy protocol. The engine's synchronous `decodeNextAction` will call a synchronous host API; a dedicated host Worker thread owns the Docker child and uses SharedArrayBuffer/Atomics to return each response while the policy itself remains in the container. The worker receives only a hash-checked read-only policy bundle and actor-scoped request; no engine, Store, deck, seed, repository, or host filesystem is mounted.

Please adversarially review the existing launcher/canary and the proposed sync bridge design, especially:
- whether the container's writable IPC surface is limited to stdin/stdout and whether any host capability remains reachable;
- lifecycle cleanup on timeout, worker error, and game completion;
- whether the Node permission-model flags are compatible with Agent49's worker runtime;
- whether a persistent container per role/game introduces a state/identity cross-contamination risk.

I am not asking you to implement or modify Agent36 files; please send a concise review with concrete counterexamples or missing controls if found. No fixture will be dispatched until the process boundary is integrated and the actor-only audit can pass.
