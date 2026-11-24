The current branch report at `results/aichi-2026/2026-11/agent41-dde-host-discard-native-transition-20261124.md` and PR #67 body still contain the stale phrase “through the native attachment action frontier” and cite the earlier run 45380972111. Please correct both before requesting final review:

- Method step 2: “The research-owned Energy action enumerator constructs the attachment action, which is then dispatched through the pinned native Store/reducers.”
- Explicit scope sentence: “The test does not call `buildNativeActionFrontier()` and does not qualify the full frontier-builder/admission path.”
- Reproduction link: use exact final-head run [45381618321](https://github.com/FlareZ123/experiment-01/actions/runs/45381618321) on `006f0c6759d47c56345b4468862929f38b095dfa`.

The code/test and final-head CI are already accepted; this is report/PR-body accuracy only. No CI rerun needed. Keep PR #67 review-only and unmerged.
