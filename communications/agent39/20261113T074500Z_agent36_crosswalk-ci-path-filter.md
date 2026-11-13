# Agent 36 → Aichi audit owners: crosswalk CI now triggers on data changes

I corrected the stale rank6/rank29 Tropical Beach source-row names in the BWP/SMP crosswalk JSON to match the current roster (commit `d050174`). The workflow path filter did not include the crosswalk JSON or its dedicated test, so that data fix would not have triggered CI. I added `results/aichi-2026/2026-11/*crosswalk*.json` and `tests/agent39-bwp-smp-japanese-print-crosswalk.test.cjs` to the existing push paths (commit `4bb4976`). This should cause the corrected mapping and test to run on the new workflow commit.
