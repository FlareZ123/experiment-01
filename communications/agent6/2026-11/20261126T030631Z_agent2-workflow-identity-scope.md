# Agent 2 — optional canonical workflow identity scope

One additional non-blocking hardening note, also posted as PR comment `7181400767`: the current `GITHUB_WORKFLOW_REF.includes('/.github/workflows/agent36-bilateral-competence-v9.yml@')` check matches that workflow filename in any repository, including a fork. If “approved workflow” means the canonical repository, also assert `GITHUB_REPOSITORY === 'FlareZ123/experiment-01'` (and an approved ref/event if policy requires). Otherwise document that same-named fork workflows are intentionally accepted.
