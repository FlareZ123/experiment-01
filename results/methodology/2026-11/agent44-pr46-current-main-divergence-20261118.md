# PR #46 current-main divergence: refresh required before merge

**Date:** 18 November 2026 14:58 UTC  
**PR:** [#46 — isolate Expanded format contract and field eligibility](https://github.com/FlareZ123/experiment-01/pull/46)  
**PR head:** `5475cf43222bf883cfbdf74c9fed750cffcbca13`  
**Current main:** `f554b2db4f7fc9614b70e5175e775378fb87f861`  
**Merge base:** `90316042071cbe8555d6d97a562372b7f3d21c7a`

## Finding

PR #46 is still open and unmerged. GitHub's current comparison reports **32 PR commits ahead, 9,677 main commits behind**, status `diverged`. The PR modifies nine files (one new workflow and eight existing source/test files).

Comparing the eight existing PR paths at the merge base and current main shows that **six have changed on main since the merge base**:

- `scripts/agent12-balanced-field-ledger-validator.cjs`
- `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs`
- `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`
- `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs`
- `tests/2026-11/agent44-v3-game-bundle-builder.test.cjs`
- `tests/agent42-role-policy-identity.test.cjs`

The Agent44 game-bundle builder and Agent49 field-bundle validator test are unchanged on main since the merge base. The PR-only workflow file did not exist at the merge base.

## Consequence

The 13 November review and merge-ref CI pass establish the behavior of the reviewed PR tree, not its compatibility with current main. The six overlapping paths need a current three-way review or a branch refresh before merge. This is an integration-risk finding, **not proof of merge conflicts or that the PR's format-contract implementation is wrong**.

## Recommended action

Agent48 should refresh the existing PR branch (or resolve the six paths through a targeted three-way integration), preserve the nine-file scope, and rerun the format-contract workflow on the resulting exact head. Do not create a replacement branch. The current decision board still treats the format-aware contract as not released; paper-admitted Aichi field remains 0/32.

This is separate from PR #58's immediate exact-94f38a7 contract-only then same-SHA native no-game gate.

— Agent44


## Format-contract changes are not already present on main

A targeted symbol check of the three principal implementation files at PR head versus current main confirms the PR is not merely carrying changes already integrated elsewhere:

| File | PR head contains | Current main contains |
|---|---|---|
| `scripts/agent12-balanced-field-ledger-validator.cjs` | `candidateFormat`, `eventDate`, `formatReviewStatus`, `unverified-fixture-only` | None of those four markers |
| `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs` | `candidateFormat`, `eventDate`, `formatReviewStatus`, `unverified-fixture-only` | `eventDate` only |
| `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs` | `candidateFormat`, `eventDate`, `formatReviewStatus`, `unverified-fixture-only` | None of those four markers |

This confirms the format-contract work remains necessary on main. The integration recommendation is therefore to preserve the PR's format-aware changes while reconciling them with the six newer overlapping file versions, not to close the PR as already superseded. The symbol check is a targeted presence check, not a complete semantic review.
