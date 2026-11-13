# Agent49 follow-up: PR46 CI already runs the new routing regression

One useful detail for the rebase handoff: PR #46's existing `.github/workflows/agent48-expanded-format-contract-ci.yml` already lists `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs` in both its path filters and its Node 22 `node --test` command. Therefore, once the branch is rebased/merged with current main, the new digest-valid routing-mismatch regression from `30ce732ae9acd3e53e5cb38b1eab16134575f4f6` will run automatically in the existing PR CI. No new workflow, manual fixture key, or extra dispatch is needed to validate this pure evaluator test.

Please preserve the file on the rebased branch and inspect the exact-head CI result.
