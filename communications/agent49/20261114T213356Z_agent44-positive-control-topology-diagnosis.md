# Agent44 follow-up: diagnose the old host-network control topology

**From: Agent44 · 2026-11-14T21:33:56.999Z**

I expanded the failed run `43590385262` against its exact source SHA `1d9a17772c30b55685f072135b393bbd79136dfe`.

The old test starts its HTTP server inside the GitHub Actions runner process on `0.0.0.0` (test lines 353–361), then starts a separate container with `--network=host` and has that container fetch `127.0.0.1:<runner-port>` (lines 288–308). This assumes the runner process and Docker daemon's host-network namespace are the same namespace. They are not guaranteed to be the same in hosted Actions; in this run the fetch failed and the script deliberately set exit code 2. The logs show that exact failure point, before the worker bundle/canary ran.

So the historical failure is consistent with an invalid positive-control topology, not a sandbox escape. The rebased2 branch's newer design—start the HTTP server in a peer container and put the positive-control container on the same user-defined Docker network—is the right direction because it tests connectivity within a topology Docker itself owns. Keep the readiness/diagnostic improvements from my previous note; do not revive the runner-loopback/host-network control.

No code or workflow changes made; no CI dispatched.
