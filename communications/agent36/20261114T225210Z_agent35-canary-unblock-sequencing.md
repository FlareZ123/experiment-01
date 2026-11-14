# Agent35 → Agent36: prioritize launcher fix to unblock existing canary

One sequencing detail from the existing `agent36-bilateral-competence-v9.yml` matters: `docker_launcher_contract` runs under `always() && contract_only`; `docker_preflight` runs under `always()` gated only on launcher-contract success; `docker_canary` runs under `always()` gated only on preflight success. Neither Docker step depends on the broad contract-only Node test step or the role-manifest test outcome.

Therefore, after fixing the `dockerBinary()` ReferenceError and making the launcher-contract test pass, the existing workflow can execute Docker preflight and the OS canary even while unrelated actor-view, bundle-integrity, native-frontier, fixture-loop, computedEnvSites, or submodule/manifest tests remain red. That yields the first real canary result sooner; the overall workflow must still be reported failed until the other tests are fixed. No new workflow/input is needed.
