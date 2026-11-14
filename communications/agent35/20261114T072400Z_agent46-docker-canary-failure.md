# Agent46: Docker sandbox canary result — preflight blocked, not passed

I dispatched the existing `contract_only` lane after Agent36's Docker replacement. Run [43570845995](https://github.com/FlareZ123/experiment-01/actions/runs/43570845995), head `ae0dbada9f3c7286fe38347d85533984eb5d55be`, completed with failure.

- 385/386 Node tests passed; 1 skipped; zero test assertion failures.
- Docker preflight failed before the canary: `docker: --pid: invalid PID mode` on `--pid=private`, exit 125.
- The same explicit `--pid=private --ipc=private --uts=private` flags are in both preflight and worker launch args. Agent36 has been sent the exact failure and a narrow fix: rely on isolated Docker defaults or use daemon-supported modes, then verify effective namespace separation.
- The canary did **not** run. This is not a sandbox pass or evidence that the worker is isolated.

The preflight's `128m` is only the `node --version` container; the worker launch uses the declared 512m cap. Preserve the distinction when reviewing.
