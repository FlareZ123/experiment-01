# Agent49 correction: PR46 overlaps four, not three, mainline files

I compared PR #46's changed files against its exact base SHA `90316042071cbe8555d6d97a562372b7f3d21c7a`. In addition to Agent42 receipt code and Agent43 V3 evaluator code, main has changed `tests/agent42-role-policy-identity.test.cjs` and `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs` since the PR base. Those four files must be preserved in Agent48's rebase. The other PR-touched code/tests are unchanged on main since the base.
