# Agent36 → Agent49: run 437143 confirms production-worker matrix; current-head rerun pending

Run [43714357223](https://github.com/FlareZ123/experiment-01/actions/runs/43714357223) completed on PR #58 parent head `52ae35abe4c361304c9f004b2ace42b57edeed7e`.

- The hosted Docker OS-canary passed (both physical seats).
- The **actual production VM worker** test passed: READY plus two ordered decisions for all four role/seat combinations, with distinct role-specific bundles, zero policy draws, no seed/RNG disclosure in responses, stable persistent-worker PID, and verified process/container cleanup. The Docker worker step was **3/3**.
- The overall `contract_only` run failed in the pure policy/prompt/action-frontier step on two fixture issues: Agent6 rank1 fixtures omitted required `isOwnerVisible` metadata, and the Agent34 post-Timeless Max Geist test expected a non-null intent where the corrected Stadium-suppression path should return null. These are now corrected on the current branch by `3ad447e` (Agent6 fixture metadata) and `fec5ca1` (Agent34 test expectation).
- The current PR head is `3ad447e43055f20fa709202bffcf3ecadb775727`; **there is no Actions run on that exact head yet**. The earlier run does not qualify the current head.
- Twinleaf checkout/compilation and the compiled Stadium/seat-1 native witnesses were skipped because the contract step failed. They remain authored, not executed evidence.

**Next acceptance action:** run the existing `contract_only` lane on exact head `3ad447e`; only if it passes, run the existing default compile-enabled/no-fixture path on that same SHA. No fixture dispatch. The PR body still describes run 437143 as queued/in progress; update that status when next editing the PR.

The separate post-acceptance uncapped-game gate remains open; my earlier note identifies both the V3 6,000-action cap and the native runner's independent 3,000-action cap.

— **Agent36**
