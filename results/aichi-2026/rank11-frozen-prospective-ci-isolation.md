# Rank-11 frozen prospective exposure: revision mismatch and CI isolation

**Agent 2, 18 October 2026, 09:52 UTC. Evidence class:** source-code object identity audit and CI repair. **No new game**, no qualification or win-rate inference.

## Observed failure and exact cause

Manual [Aichi benchmark run 39116362759](https://github.com/FlareZ123/experiment-01/actions/runs/39116362759) ran on main at commit `c6aeefbadf0bebc6257a6928ea6afd3112ff2239`. The ordinary benchmark job and five Dragon attack-panel tests passed. Its separate `rank11-source-census` job failed in `executeRank11ExposurePartition` at the explicit `assert.deepEqual(registered, expected)` source-fidelity gate, before gameplay. This is a **fail-closed registered-revision mismatch**, not a losing trial or an engine regression.

The original committed `results/aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json` freezes all four research-side Git blob IDs. At audit time, the main-branch IDs compared as follows:

| File | Frozen registration / original `c9e8e72` | Current main when audited | Match |
| --- | --- | --- | --- |
| `rank11-autonomous-opener.cjs` | `4eb0f84b0fca36922b8a32b5d753ffbf6ef3d488` | same | yes |
| `policy-profiles.cjs` | `3aaaf405ad3a7831eaea788ba4c0f456dcf6a196` | `8ab2861647cca23f71a05cf7b53fead210c921e8` | **no** |
| `rank11-boostshake-opening-eligibility.cjs` | `ae7d7cb6f175417e1a2add29fafac44244ca9e37` | same | yes |
| `headless.cjs` | `4d5e972290ba8b8c8637f19ff44b31606e3d1868` | `4099ea91e8fa46da0f2126a6ade1a76b267e5519` | **no** |

The frozen source branch `research/rank11-prospective-exposure-20261018` remains pinned at commit [`c9e8e72c367147cae46562a15d400ea18c691003`](https://github.com/FlareZ123/experiment-01/commit/c9e8e72c367147cae46562a15d400ea18c691003), and all four file IDs there match the registration exactly. Its original partition-0 run [39095223455](https://github.com/FlareZ123/experiment-01/actions/runs/39095223455) and posthoc evidence remain historical diagnostic data, not current-main policy evidence.

## Repair and execution contract

Updated the **existing manual-only** `.github/workflows/aichi-benchmark-stats.yml` in commit [`e896cf06`](https://github.com/FlareZ123/experiment-01/commit/e896cf06cda79c5b140903e64b76e2009720bbbc) to add `workflow_dispatch.inputs.rank11_source_census` (boolean, default `false`) and `jobs.rank11-source-census.if: inputs.rank11_source_census`. Ordinary benchmark jobs now run without automatically entering the archived strict rank11 registration test. An explicit opt-in will still run the original strict test and **must reject** incompatible live blobs.

To complete predeclared partitions 1–3, use the recorded pinned source commit, and verify the four blobs, entire registered frame hash, exact candidate/field decks and actual start logs. Preserve the original fixed trial IDs and all failures. Do not copy the v1 registration into main, replace its pinned blobs with latest main, or relabel a prospective frozen-v1 campaign as current-v2. Any new code/policy requires a separately precommitted protocol and different candidate-policy identity.

This change does not assert that current-main tooling is correct, that the historical rank11 policy wins, or that the main benchmark is a paper-rule validation. **Field 29/32 exact printed lists; qualified competitive games 0; final 99.5% goal unmet.**

## Follow-up

Verify a default manual benchmark dispatch has the frozen job **skipped** and unrelated test job run. On explicit `rank11_source_census=true`, verify source revision equality first; invoke the frozen branch rather than spending main CI on an expected mismatch. Coordinate with Agent 30 before running remaining predeclared trials.
