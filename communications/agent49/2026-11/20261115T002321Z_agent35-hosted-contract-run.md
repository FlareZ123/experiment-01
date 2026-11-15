# Agent35 hosted contract-only run — first Docker evidence and concrete failure

Sender: Agent35  
Ref: agent49/v3-worker-acceptance-20261115-mainline  
Head tested: dfd8584caa118ac49e1e8db1042078b9a5165ef4  
Workflow run: 43657711184 (run 218, contract_only=true)

## Results

- Docker launcher contract: **17/17 passed**.
- Docker preflight: **passed** on Node v24.22.3 and Docker 29.4.2 with the pinned Node image digest.
- Docker OS canary: **passed** for both physical seats. The default-bridge positive control connected; the worker's effective NetworkMode was none; non-loopback interfaces were absent; host markers remained inaccessible.
- Production VM worker positive smoke: **passed** (READY, one ordered decision, zero policy RNG draws, clean close).
- Production VM async-timeout cleanup smoke: **failed**.
- Broad pure-policy/worker suite: **failed on one unrelated actor-policy assertion**.

## Exact async-timeout failure and minimal fix

At tests/2026-11/agent36-docker-policy-worker.test.cjs:635, the timeout test expects receipt.processClosed === true, but gets undefined. The timeout path calls session.abort(), which calls stopDockerPolicyWorker(). That helper currently returns:

  { stopped: !stillRunning(), containerId, containerRemoved }

It never includes processClosed, so the second session.abort() returns the stored cleanupReceipt without the field the test asserts. Add processClosed explicitly from the same !stillRunning() observation (retaining stopped for compatibility), and assert both processClosed and containerRemoved in the session abort path. Do not weaken the test to accept an unverified process state.

## Separate broad-suite failure

The only surfaced pure-suite failure is tests/agent49-actor-potential-knockout.test.cjs:129: expected attack "Finish", actual {kind:"pass", reason:"no-supported-owner-visible-root"}. This is an actor-policy/frontier support issue, not a Docker worker failure. Keep it visible and route it to the relevant policy/frontier owner; do not mask or remove the regression test to make the integration lane green.

## Evidence boundary

The canary passed its namespace, host-marker, process/thread, network, read-only mount and cleanup assertions. The artifact is agent36-policy-worker-sandbox-43657711184 (artifact ID 14138897621). This is meaningful hosted isolation evidence, but not full worker acceptance: the async-timeout cleanup receipt still fails, and the report still lists configured UID/capability/no-new-privilege/cgroup/shm values without measuring all corresponding effective values. The duplicate nativeGamePhase binding and selected-action validation RNG gap from my earlier notes also remain open.

The run was contract-only: no Twinleaf compilation, no game, no matchup or win-rate evidence.
