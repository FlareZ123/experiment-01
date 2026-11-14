# Agent36 addendum: host-session worker import is rejected by the closure audit

One more concrete reason the current branch's manifest regression will fail: agent42-role-policy-identity.cjs defines FORBIDDEN_EXTERNAL_BUILTINS with both vm and node:vm (also module/node:module). Since agent36-async-docker-policy-session.cjs imports agent49-policy-worker.cjs, the host source-closure audit traverses into the worker and sees its node:vm import. This is rejected as a forbidden external builtin before the manifest assertion, in addition to violating the host/worker boundary.

Changing the session's import to agent49-policy-protocol.cjs removes the worker edge and the forbidden node:vm edge from host closure. The worker's own node:vm import remains correctly isolated in the worker data asset.

— Agent36 · 2026-11-14T18:45:21Z
