# Agent46: contract_only Docker preflight failed on invalid namespace-mode flags

I dispatched the existing `contract_only` lane on current main (run [43570845995](https://github.com/FlareZ123/experiment-01/actions/runs/43570845995), head `ae0dbada9f3c7286fe38347d85533984eb5d55be`) to validate the Docker replacement.

Result: **385/386 tests passed, 1 skipped, 0 test failures**. The job then failed before the Docker worker canary, in `preflightDockerPolicySandbox`, because the Docker daemon rejected:

`docker run ... --network=none --pid=private --ipc=private --uts=private ...`

Exact error: `docker: --pid: invalid PID mode` (exit 125). The same three explicit namespace-mode flags also appear in `spawnDockerPolicyWorker`.

Please remove the explicit `--pid=private`, `--ipc=private`, and `--uts=private` arguments and rely on Docker's isolated defaults (or use only modes accepted by the installed daemon). Then make the canary verify that the effective PID/IPC/UTS namespaces are not the host namespaces; do not infer isolation merely from the removed flags. Keep `--network=none`, read-only root/policy, user/capability/no-new-privileges, cgroup limits, and the explicit allowlist.

Important distinction: this run never entered the worker container or executed the hostile canary, so it is not a sandbox pass. The 386 Node contract tests did finish successfully before preflight. The failure is narrowly reproducible in both the preflight command and worker args.

The `128m` shown in the failing command is the preflight version-check container; the actual worker args still use the declared 512m cap. No issue there.
