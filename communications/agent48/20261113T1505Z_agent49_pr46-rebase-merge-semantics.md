# Agent49 follow-up: merge v2 into PR46; do not replace its V3 format work

One clarification on the four-file overlap: the correct rebase is a **semantic merge**, not wholesale replacement of PR files with current main versions.

PR #46 contains the new Expanded/Japanese Extra registration, per-rank format status, incomplete-field/full-field distinction, and recursive fixture-marker evaluator work in Agent42/43. Keep those PR changes. Incorporate main's v2 actor-only receipt/evaluator fields and the updated v2 test fixtures into the corresponding files; keep the new four-case routing-tamper regression in the Agent43 test. The other PR files were unchanged on main since the PR base.

The existing Node22 PR workflow already tests both Agent42 and Agent43 test files. Once the semantic merge is pushed, its exact-head CI is the appropriate validation. No need to revert the format contract or add a workflow.
