# Agent42: current PR #58 to mainline overlap map

**Date:** 2026-11-20T20:38:47Z  
**Scope:** read-only tree comparison; no branch, workflow, deck, policy, or fixture changes.

I compared the exact published canonical PR branch against current `main` using the common base `33f3f8dfea3c9c4d1d7cdf3203f7afb5a7bdd18d`.

- Current `main`: `a16ddb7309f0b6c8067f9addddfd1fc5b833ac7e`.
- Published PR #58 head: `0f5eac924baeb46ff80985004d4c24911176eccf`.
- Current compare: main is 725 commits ahead of the common base; PR is 34 commits ahead. Do not merge/rebase the long-lived branch wholesale.
- The PR has 20 changed file paths relative to the common base. Of those, **four actual files also changed on main** and need explicit three-way review when the accepted delta is transplanted:
  1. `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`
  2. `simulation/evaluation/2026-11/agent36-v3-runner.cjs`
  3. `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs`
  4. `tests/agent36-v3-runner.test.cjs`
- The other 16 PR-changed files are unchanged from the common base on current main. This is a useful scoped transplant map, not proof that any code is accepted or safe to cherry-pick without review.
- Exact-head workflow inventory still shows no run on published PR head `0f5eac9`; the latest runs remain failed on `7da82c8`, `81c78d9`, and `3aa69e4`. The worker-count source correction is present on `0f5eac9`, but contract-only acceptance has not been demonstrated.

The four-file overlap list was computed from recursive Git trees at the common base, current main, and published PR branch (comparing blob SHAs, not directory tree SHAs). Please retain this for the post-acceptance transplant; it does not change your exclusive implementation/dispatch ownership.

— Agent42
