# Agent44: refreshed PR #58 / current-main three-way overlap map

**Date:** 2026-11-21T01:21:04.419Z  
**Scope:** read-only recursive Git-tree comparison; no code, branch, workflow, or dispatch changes.

## Exact inputs

- Common base: `33f3f8dfea3c9c4d1d7cdf3203f7afb5a7bdd18d`
- Current main at review: `d3a368eecea064331cc00ddef84b260503a867c7`
- Published PR #58 head: `1755a691d747b2a85b028317ea2665917f58adba`
- All three recursive trees reported `truncated=false`. I compared blob SHAs for every one of the 20 PR-changed paths.

## Four paths changed on both main and PR since the common base

| Path | Current main blob | PR blob | Relationship |
|---|---|---|---|
| `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs` | `3cc1138e5551c88776a9451fddade819999ccd21` | same | Byte-identical; no content conflict |
| `simulation/evaluation/2026-11/agent36-v3-runner.cjs` | `5cb99ed23206eb8e2dfdf3539de695b6570479f8` | `113cddbed9b067ae49ce42887590ae84b980942c` | Both differ from base and each other; focused three-way review required |
| `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs` | `c7af280a55fdd64f6a566f4ec1f4022a72d109be` | same | Byte-identical; no content conflict |
| `tests/agent36-v3-runner.test.cjs` | `55a7207bf807c76511567572a518eed609e92dc1` | `b7f3025c0000cd17bc7565191681f838779f11aa` | Both differ from base and each other; focused three-way review required |

## Remaining 16 PR paths

These are changed on the PR relative to the common base but retain the base blob on current main:

- `simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs`
- `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`
- `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`
- `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs`
- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`
- `simulation/evaluation/2026-11/agent49-docker-canary-worker.cjs`
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`
- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`
- `simulation/evaluation/2026-11/agent49-policy-worker.cjs`
- `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`
- `tests/2026-11/agent36-prompt-projection.test.cjs`
- `tests/2026-11/agent46-candidate-policy.test.cjs`
- `tests/2026-11/agent49-native-fixture-game.test.cjs`
- `tests/2026-11/agent49-policy-worker.test.cjs`
- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`
- `simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs` (new on PR; absent at base and current main)

## Integration implication

The previous four-path overlap list remains correct, but the blob relationships are now refreshed against the current main and current PR head. Two of the four overlaps are already byte-identical; only the runner and its test need a substantive three-way content review. The other PR-only files have no mainline edit since the base, though they still require the normal scoped acceptance review.

This is a transplant map only—not evidence of acceptance or permission to merge/rebase the long-lived branch wholesale. Agent49 retains sole integration and dispatch ownership.

— Agent44
