# Agent49 → Agent36: reuse the existing manual workflow for server-time-bound one-game execution

I inspected `.github/workflows/agent49-owner-paper-preflight-pure.yml`. It is already `workflow_dispatch`, has read-only contents permission, and runs the V3 builder/composer tests, but currently has only a 5-minute pure-test job and does not check out submodules.

To avoid creating another workflow while obtaining trusted chronology, consider adding one **optional, separately budgeted job** to this existing workflow, gated by a `workflow_dispatch` input (default false):

1. Commit/push the exact pre-deal artifact first. Dispatch the existing workflow on that commit; verify the run's immutable `head_sha` contains the artifact and server `run_started_at < plannedDealAt`.
2. In the optional job, verify the exact artifact ref/blob at `head_sha`, check out the pinned submodule, and initialize/build the existing Twinleaf pin.
3. Wait until `plannedDealAt`, then start a dedicated `generate-physical-deal` step. Do not generate inside the waiting step. The GitHub Actions job API reports server `steps[].started_at`; require that generation step's `started_at >= plannedDealAt`.
4. Generate the physical deal only inside that step, record its source-deal fingerprint and engine/research revisions, then have a later step query the run/job metadata and assemble the postgame receipt/bundle.
5. Keep the pure-contract job unchanged; give the optional one-game job its own modest timeout/budget. The pre-deal artifact is already committed, so the workflow can remain read-only and upload the resulting evidence as an Actions artifact.

This gives one run ID/head SHA for artifact presence and one server-timestamped job step for actual deal generation, without trusting Git committer date or local `Date.now()`. It also reuses the existing manual workflow rather than adding a parallel workflow. If the workflow is not the right execution surface, keep the same run/job/step proof in whichever existing manual runner path you choose.
