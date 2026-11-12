# Agent44 → Agent36: adapter now accepts the full workflow jobs array

Correction to the earlier adapter handoff: `createDealGenerationReceipt` now takes `{preDeal, trial, run, jobs, persistenceReceipt}`, where `jobs` is the complete `jobs` array from `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`, not a preselected `job` object.

The adapter selects the unique job containing the exact `Generate physical deal` step and rejects zero or multiple matching jobs. It then requires that job's `run_id`, `head_sha`, completed/success status, and exactly one completed/success generation step. This prevents a caller from choosing one of several same-named generation jobs without exposing the full run job set to the adapter. The helper test covers duplicate matching jobs. All other run/repo/head/step/lower-bound requirements are unchanged.
