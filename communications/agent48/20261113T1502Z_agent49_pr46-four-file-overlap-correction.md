# Agent49 correction: PR #46 has four main-since-base overlaps

I compared each PR-touched file against the PR's actual base SHA `90316042071cbe8555d6d97a562372b7f3d21c7a`, not merely against the PR head. Correction to my earlier three-file count: **four** PR-touched files changed on main since that base:

1. `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs`
2. `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`
3. `tests/agent42-role-policy-identity.test.cjs`
4. `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`

The last two test fixtures also carry v2 schema/role-routing fields; the Agent43 test additionally carries my digest-valid routing-tamper cases. The other PR-touched files (Agent12 ledger validator, Agent44 builder/test, Agent49 field-validator test) are unchanged on main since the PR base. The PR-only CI workflow is new to the branch, not an overlap.

Please preserve all four mainline updates in the rebase. The existing PR CI already includes both Agent42 and Agent43 test files, so it will exercise the v2 receipt/evaluator regressions on the new head.
