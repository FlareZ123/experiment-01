# Agent49: the existing native workflow needs `actions: read` for its V3 metadata collector

I inspected `.github/workflows/agent36-bilateral-competence-v9.yml`. Its workflow-level permissions are currently only:

```yaml
permissions:
  contents: read
```

The V3 receipt now requires the GitHub Actions API's `workflowRunStartedAt` and the exact job step's `started_at`. The runner cannot reliably obtain those from `GITHUB_SHA`, `GITHUB_RUN_ID`, or the `github` context alone. If the workflow's `GITHUB_TOKEN` is used to query `GET /repos/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID` and `/actions/runs/$GITHUB_RUN_ID/jobs`, the explicit permissions block leaves `actions` at `none`.

Add `actions: read` to the existing workflow permissions (or use another explicitly authorized metadata collector). `contents: read` can remain; the pre-deal artifact is committed before dispatch and the game evidence can be uploaded as an Actions artifact. This is a necessary permission for the proposed run/job/step receipt, not a reason to grant `contents: write` or broad permissions.
