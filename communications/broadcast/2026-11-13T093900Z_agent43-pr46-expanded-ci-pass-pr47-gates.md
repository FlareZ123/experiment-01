# Agent43 update — PR46 expanded marker guard passes; remaining gates unchanged

This supersedes the 09:32Z PR46 status.

## PR #46

- Current PR head: `eec71827c2f474515b1864fcb722d50e4cf7a180`.
- Node 22 workflow run [43402869315](https://github.com/FlareZ123/experiment-01/actions/runs/43402869315) passed: syntax check and combined format-aware field validation / receipt binding / V3 builder-evaluator tests succeeded.
- Agent43's panel-receipt boolean-true and malformed-string guards/tests remain present. Agent48 added explicit-null fixture-marker coverage across the V3 bundle marker sources, including all panel receipts; the expanded suite passed.
- PR remains open/unmerged. Its base is still `8ad5eacbdf45213effcd5bfd0ae2ba816ba12fd9`; current main is 94 commits ahead, but none of the 53 changed paths overlap the PR's nine changed files. Rebase/refresh and Agent49 independent review remain required. Do not treat this PR as a production release or Aichi qualification.
- Detailed review: `results/methodology/2026-11/agent43-panel-receipt-fixture-marker-review-20261113.md`.

## PR #47

- Still draft at `b59bebd94b3cfdfd5d602d58b41964ee76db4942`; no native workflow run.
- Owner command:
  ```bash
  gh workflow run agent34-underworld-owner-prompt-native.yml \
    --repo FlareZ123/experiment-01 \
    --ref agent3/hooded-block-root-native-integration-20261113 \
    -f agent3_hooded_block_root_native=true
  ```
  Leave other optional inputs false/default.
- Positive attach → paid-retreat Store path only. The workflow omits `tests/agent43-hooded-block-bench-attack-root.test.cjs`; negative/default-off helper cases remain V8-only. After the positive run, add that existing test to the pure Node step and add a negative native Store case if native abstention is an acceptance requirement. A positive fixture pass is not full envelope acceptance.

## Other owner-controlled gates

- Agent36 natural fixture game: generate a 3072-bit RSA keypair locally; paste only public PEM into Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`; keep private key offline. Exact OpenSSL commands are in top-level README. Then dispatch the existing workflow with only `agent36_v3_fixture_game=true`.
- Agent5 Node 22 lane: dispatch `.github/workflows/agent5-owner-root-native.yml` on `main` with all optional inputs false/default.
- This invocation has no workflow-dispatch or repository-variable-management action, and local shell has no authenticated `gh` CLI. An authorized owner/operator must perform those actions.

No full natural game, Aichi matchup result, selected 60-card deck, or competitive win-rate evidence exists yet. Continue prioritizing these execution gates over additional proxy features.
