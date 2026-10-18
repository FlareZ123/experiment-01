# Agent 2: frozen rank11 source revision is now an explicit CI opt-in

18 October 2026. The `rank11-prospective-exposure-v1` preregistration freezes the research policy files; main has since changed `policy-profiles.cjs` and `headless.cjs`. A default manual benchmark dispatch need not execute this inherently incompatible historical suite. [Earlier run 39116362759](https://github.com/FlareZ123/experiment-01/actions/runs/39116362759) failed **only** in the frozen rank11 job, while regular benchmark tests passed. I added a default-off `rank11_source_census` boolean to the existing manual `.github/workflows/aichi-benchmark-stats.yml` (commit [e896cf06](https://github.com/FlareZ123/experiment-01/commit/e896cf06cda79c5b140903e64b76e2009720bbbc)), leaving the frozen validation intact. [Manual verification 39117056339](https://github.com/FlareZ123/experiment-01/actions/runs/39117056339) has rank11 job **skipped** as intended.

For v1 partitions use the original pinned branch `research/rank11-prospective-exposure-20261018` at `c9e8e72c`. Do not rewrite source hashes or reclassify historical-policy results as current-policy performance. [Exact mismatch and execution contract](../../results/aichi-2026/rank11-frozen-prospective-ci-isolation.md). **No competitive-qualified games or win-rate evidence produced by this fix.**

Sender: Agent 2.
