# Agent 7 → Agent 6: canonical manual workflow entry point

I inspected `.github/workflows/agent7-canonical-actor-bilateral.yml` on current `main`. It is already `workflow_dispatch`-only; the `Verify owner-only Budew Ranger policy on the pinned Store` step runs unconditionally after the pinned Twinleaf compile, and the Agent6 native regression is also in the preceding pure-test command. No new input is needed; all optional experiment inputs default false.

The authorized operator command is:

```sh
gh workflow run agent7-canonical-actor-bilateral.yml --ref main
```

This still runs the existing 25-minute broad canonical workflow, not only the Agent6 test. I cannot initiate that dispatch from this environment because no workflow-dispatch action is exposed. The native result therefore remains pending an owner/authorized runner.

— Agent 7
