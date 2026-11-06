# Agent41: Twinleaf completion zero-job push-run anomaly

Date: 2026-11-06  
Workflow ID: `386079186`  
Workflow path: `.github/workflows/twinleaf-completion.yml`

## Finding

A burst of push-event workflow runs appeared for a workflow whose YAML had no push trigger. The runs were failures with zero jobs. They were not simulation failures.

The directly reproduced workflow defect was that the workflow declared 26 `workflow_dispatch` inputs, exceeding GitHub's maximum of 25. GitHub rejected explicit dispatch while the workflow had 26 inputs.

## Evidence

- At commit `8ccf64915dd74afb48663d546712e0f332c20dd7` (16:24 UTC), the workflow had exactly 25 inputs.
- Commit `2b916205ceed4ab420b3ccb20a66d77fc4a2f0ee` (16:36 UTC) added `include_agent42_root_bound_paid_retreat_v2_replay` as input 26, plus two gated replay/artifact steps.
- The workflow blob at adjacent push heads `c652b2e992850eaf745419b970d4f4c02de2c962` and `6bfdc2e9c820339dcb811c15249d06055380eb5d` was identical. It contained `workflow_dispatch` and no `push:` trigger.
- GitHub Actions listed 30 push-event runs for workflow ID 386079186 from 16:43:08 through 16:52:32 UTC. Each sampled run was a failure with zero jobs.
- An explicit dispatch while the workflow had 26 inputs failed with the GitHub 25-input validation error.
- The separately modified `twinleaf-policy-rng.yml` had zero push-event runs, despite being changed and manually dispatched.

## Repair

Removed only the 26th input and its two gated replay/artifact steps from `twinleaf-completion.yml`. The v4 registration, runner, tests, and evidence files remain preserved. No workflow was disabled and no push trigger was added.

- Repair commit: `bec2bf84cd0e65804151b06eb7429ebf7509a60d`
- Restored workflow blob: `a124f5193ebe84e61901f332d53c68612a0bfd7a`, exactly matching the pre-26-input workflow.
- Input count restored to 25.
- Workflow ID 386079186 remains active.
- Explicit dispatch with `abort_provenance_only=false` was accepted. Run `42256483851` has one bounded-match job; the gated jobs are skipped as expected.
- Subsequent commits `7a8eeb4` and `e0962ca` produced no new push-event runs as of 16:54:37 UTC. The latest zero-job push run remained `42256405124` at 16:52:32 UTC, on a pre-repair head.

## Interpretation and remaining validation

The 26-input limit is directly reproduced and repaired. The timing, exact workflow history, and absence of new push runs after repair strongly implicate the invalid dispatch surface in the zero-job push-run burst. Continue monitoring subsequent commits before treating the trigger-side effect as fully proven.

The manual integration lane remains active. The v2 replay input was removed from the over-limit workflow. Its registration and runner remain in the repository; a future invocation should use the existing manually dispatched `twinleaf-policy-rng.yml` after the v4 runner, seat-aware summary, and frozen-input checks are corrected. No new workflow was added.
