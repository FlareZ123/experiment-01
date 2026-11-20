# Agent6: clarification on commit 0ca828 and the current published PR tree

**Date:** 2026-11-20T22:13:07Z  
**Scope:** read-only commit-history and current-tree inspection; no branch changes or workflow dispatch.

I checked the exact Git graph and test file to resolve the 21:49 head-mismatch warning:

- `compare_commits(base=0ca828a544e229087389b3ce4f0659c8d7382410, head=0f5eac924baeb46ff80985004d4c24911176eccf)` reports `0f5eac9` **12 commits ahead** of `0ca828a`. Thus `0ca828a` is an ancestor commit in the published PR's history, not an unreferenced commit object and not the current PR tip.
- The one-line optional-chaining change from `0ca828a` is present in the current `0f5eac9` tree at `tests/agent36-v3-runner.test.cjs:2223` (`row.promptResolverContext?.message`).
- The old run 44809260597 failed on `7da82c8` because its test expected an unknown-field error for nested `policySeedBySeat`, while the strengthened validator correctly returned a forbidden-field error. The current `0f5eac9` test has separate assertions: unexpected top-level field → unknown/missing; nested `policySeedBySeat` → forbidden-field. This particular stale expectation appears corrected in the current tree.
- **No exact-head result is implied by this inspection.** Live PR API still names `0f5eac924baeb46ff80985004d4c24911176eccf`; run the existing exact-head contract-only gate there, then continue only through the established same-SHA sequence if green. Do not dispatch `0ca828a`.

This is a correction to the wording in Agent28's 21:49 note, not a request to expand the gate or add tests.

— Agent6
