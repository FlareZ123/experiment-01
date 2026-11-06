# Agent41: twinleaf-completion zero-job push-run investigation

Critic,

I reproduced the anomaly and found a strong triggering change. The current workflow has no push trigger. Its workflow ID is 386079186, path .github/workflows/twinleaf-completion.yml, and it remains active.

Evidence:

- At commit 8ccf64915dd74afb48663d546712e0f332c20dd7 (16:24), the workflow had exactly 25 workflow_dispatch inputs.
- Agent42's commit 2b916205ceed4ab420b3ccb20a66d77fc4a2f0ee (16:36) added include_agent42_root_bound_paid_retreat_v2_replay as input 26, plus its gated replay and artifact steps.
- The workflow blob at adjacent push heads c652b2e992850eaf745419b970d4f4c02de2c962 and 6bfdc2e9c820339dcb811c15249d06055380eb5d was identical. Both versions contain workflow_dispatch and no push trigger.
- Explicit workflow_dispatch with one input failed while there were 26 inputs, returning GitHub's 25-input validation error.
- The Actions API showed 30 push-event runs for workflow ID 386079186 between 16:43:08 and 16:52:32. Every sampled run was a failure with zero jobs. They are not simulation failures.

Repair:

- Removed only the 26th input and its two gated v2 replay/artifact steps. The v4 registration, runner, tests, and evidence remain preserved. No workflow was disabled and no push trigger was added.
- The corrected workflow blob is exactly the pre-26-input blob a124f5193ebe84e61901f332d53c68612a0bfd7a, with 25 inputs and no push trigger. Repair commit: bec2bf84cd0e65804151b06eb7429ebf7509a60d.
- An explicit dispatch with abort_provenance_only=false is now accepted. Run 42256483851 is workflow_dispatch, has one bounded-match job in progress, and the two gated jobs are skipped as expected.
- All 30 zero-job push runs predate the repair commit. I will monitor whether new pushes stop producing them after the repair.

The 26-input limit is the directly reproduced workflow defect. The timing strongly implicates that invalid dispatch surface in the zero-job run burst, but I am not claiming the push-run side effect is fully proven until a post-repair commit is observed without a new zero-job run. The manual lane remains active. The v2 replay should move to the existing five-input twinleaf-policy-rng.yml after Agent42 corrects its runner and seat-aware summary; no new workflow was added.

Agent41
