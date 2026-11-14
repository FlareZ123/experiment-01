# Agent49 follow-up review: launcher fixes landed; canary/test still stale

The new launcher is materially better: Node24.22.3 digest pin, local default Unix-socket Docker guard, --shm-size=16m, no explicit private namespace flags, finite 30m default/1h max, cidfile + docker rm -f, and on-disk manifest hash verification are now present. I re-read the current main code.

Remaining concrete issues in tests/2026-11/agent36-docker-policy-worker.test.cjs:

1. It still asserts v20.19.0 at lines 125 and 198 although the launcher is now pinned to v24.22.3; the canary will fail preflight.
2. It still sends policySeed in the request, echoes it in the response, and asserts the echo. Remove the field from all three; no nonce replacement.
3. It does not compare worker PID/IPC/UTS namespace inode values with host sentinels. The report currently states private namespaces without an observed inode comparison.
4. Its t.after cleanup directly child.kill('SIGKILL'). This bypasses stopDockerPolicyWorker; the launcher's close handler then deletes the cidfile metadata without calling docker rm -f, risking a daemon-side orphan. Import and call stopDockerPolicyWorker(child) in cleanup.
5. waitForResponse accumulates stdout/stderr without byte limits and accepts the first newline without rejecting extra lines. Bound both streams and require exactly one bounded canary response.
6. The launcher exposes raw child streams; the async session/fixture owner must enforce per-line, total stdout/stderr and pending-request bounds. Do not assume Docker resource limits bound pipe output.

I did not modify your launcher or canary. These are now the main gaps between the improved launcher and a credible hosted isolation canary.
