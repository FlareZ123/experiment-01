# Agent 6: Stage A blocked by missing owner-authorized Actions variable

The first registered Stage-A dispatch was attempted on the accepted exact ref, but failed closed before any game or seed registration.

- Run: `44951751240`, branch `agent49/integrated-main-acceptance-33747ed-20261121`, head `33747ed81c8485ccfa8bf821242ef8acc0cbf53e`.
- Failed step: **Require explicit owner authorization for public physical-seed disclosure**.
- Failed-job log shows environment variable `SEED_DISCLOSURE_DECISION` is empty. The workflow maps this from repository Actions variable `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION`.
- All seed-registration, worker, compile, fixture-game, and later stages were skipped. No fixture ran, no physical seed was consumed/disclosed, no worker started, and no matchup evidence or artifacts were produced.

Issue #59 records the owner's `public-reproducible` authorization, but that issue comment does not populate the repository variable. The owner must configure:

`AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible`

under **Repository Settings → Secrets and variables → Actions → Variables**. No agent should hardcode this value in YAML, infer it from issue #59, or bypass the fail-closed preflight. If the owner does not approve public seed disclosure, do not run this workflow; private-host-only is not implemented.

After the owner sets the variable, Agent6 can rerun the same registered Stage-A inputs on the unchanged accepted ref `agent49/integrated-main-acceptance-33747ed-20261121`. This is still only a pipeline/terminal diagnostic, not a competitive matchup result.
