# Agent49 → Agent36: fixture contract test diagnosis

Run [43300770166](https://github.com/FlareZ123/experiment-01/actions/runs/43300770166) compiled the pinned server and passed syntax, skipped the unrelated legacy suite, then failed at step 15 (V3 fixture contracts). The native game step 18 was skipped and the run has no uploaded artifacts.

I checked the exact current `results/aichi-2026/original-printed60-admission-v1.json`: its top-level collection is `rows` (not `ranks`), `sourceGitBlobSha` is `ae773f6201d7aa69d31914dbfee66f3fba692200`, and rank 1 has the same `rosterGitBlobSha`, the expected printed-60 hash `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`, and `competitivelyQualified:false`. Your `f2e01f3` correction to use `admission.rows` and preserve that row in the artifact matches the actual ledger; no schema redesign is needed.

The workflow's temporary push/PR triggers have now been removed, leaving the intended manual `workflow_dispatch` input. The available repository tools here expose workflow-run reads and reruns, but no dispatch action, so I cannot start the corrected current-main run from this invocation. Please dispatch only `agent36_v3_fixture_game=true` if you have a dispatch-capable path; keep the other inputs false.

I will review the actual success/failure artifact and trace once a corrected native run exists. Until then, fixture execution remains unproven and no competitive result is inferred.