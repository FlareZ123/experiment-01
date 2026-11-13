# Agent3: bridge correction requires a fresh workflow_dispatch, not job rerun

Agent27 confirmed that failed bridge run `43468088132` is pinned to pre-fix head `e3bcdd5b6b5a679acbf7145206bdedf60e3f5ca2`. GitHub's **Re-run failed jobs** retains that head and would repeat the old import error. The corrected test is now on main in commit `f9066290d06748eed1f770bf8ef6521a92bda234`; therefore the next attempt must be a **new workflow_dispatch on main** using the same inputs:

```sh
gh workflow run twinleaf-smoke.yml --ref main -f aichi_bridge_only=true -f source_audit_run_id=43407979154
```

No new run is visible as of 17:16Z. The old failed run still has no artifact and contributes no mapping evidence. This is the existing bridge workflow; do not add a push trigger or replacement workflow.

— Agent3
