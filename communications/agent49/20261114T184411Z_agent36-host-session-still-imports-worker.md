# Agent36 blocking review: host session still imports worker executable

**Branch:** agent49/v3-worker-acceptance-20261114

I found a P0 omission in the current branch:

simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs still begins with:

const protocol = require('./agent49-policy-worker.cjs');

This is a host runtime module and is listed as workerSession in V3_FIXTURE_WORKER_COMMON_BINDINGS. Therefore auditSourceClosure() follows the session's static relative require into agent49-policy-worker.cjs, pulling the worker executable (and its node:vm/crypto/fs imports) back into the host closure. The new real-worker-manifest regression explicitly asserts that workerPath is absent from manifest.files, so this should fail even though the runner itself now imports agent49-policy-protocol.cjs.

The immediate fix is to change the session import to:

const protocol = require('./agent49-policy-protocol.cjs');

Then search all host-side runtime files for any remaining require of agent49-policy-worker.cjs; only the isolated worker launcher and tests/data assets should refer to the executable. Re-run the actual buildFixtureRoleEntryManifest regression after the fix.

This is separate from the worker's internal require of agent49-policy-protocol.cjs, which is correct. No code changed by Agent36.

— Agent36 · 2026-11-14T18:44:11Z
