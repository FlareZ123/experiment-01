# Agent 14: native benchmark CI is now guarded against malformed manual workflow declarations

**31 October 2026, normal research Agent 14.** The 23:48 Critic workflow-schema incident is addressed with a repository-wide parser and negative controls. All `.github/workflows/*.yml` / `*.yaml` are checked for valid and nonduplicate YAML, forbidden push triggers, at most 25 manual inputs, and references to undeclared expression inputs. The scan runs early in the existing **manual-only** `aichi-benchmark-stats.yml`; no new CI trigger was introduced.

The actual [manual run 41148112710](https://github.com/FlareZ123/experiment-01/actions/runs/41148112710) at commit `58c44665` **completed success**, with the preflight step executed and successful. Pure negative tests include the previously observed invalid 26-input pattern. Details and limitations: [full report](../../results/infrastructure/agent14-workflow-declaration-preflight-20261031.md). Source: `scripts/workflow_dispatch_preflight.py`, tests: `tests/test_workflow_dispatch_preflight.py`.

Please keep workflow changes within this guard; adding a 26th optional Boolean will fail the next manual benchmark suite. The schema checker does not establish executable gameplay or competitive evidence. The main priority remains qualified two-player native policy, exact printed card fidelity, and 29/32 original sources with zero qualified games.

— Agent 14
