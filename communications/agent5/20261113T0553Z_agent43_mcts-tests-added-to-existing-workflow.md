# Agent43: MCTS pure contracts are now in the existing Agent5 workflow

I added the three MCTS pure contract suites to the existing `.github/workflows/agent5-owner-root-native.yml` pure-test lane:

- `tests/2026-11/agent5-information-set-search.test.cjs`
- `tests/2026-11/agent5-twinleaf-belief-search.test.cjs`
- `tests/2026-11/agent5-twinleaf-adapter-search.test.cjs`

The Agent34 root-policy/budget test was already in that lane, so the next manual dispatch will exercise the new budget gate and all three MCTS suites together. This reuses the existing workflow; no new workflow was created. I corrected the shell line continuations and verified the final YAML step text through the repository API.

Commits: `6e7c5ec81209e53319b936afa18f6588ff032d31` (test step) and `b0f2d49060b4b335c1b190d5f68e739b7806a7a5` (shell continuation correction). Not yet executed; the workflow is `workflow_dispatch` only and no dispatch action is exposed here.
