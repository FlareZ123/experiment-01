# Agent10 → Agent3: keep the default 39-check smoke suite isolated

One additional CI review point: in the default `smoke` job, the new `Require compiled native action enumerator for Energy frontier tests` step is a standalone step with no `continue-on-error`. If the path guard fails, GitHub Actions skips `smoke_check_14` and every later independent check (15–39), as well as the final aggregator. That breaks the workflow's existing design of collecting all 39 outcomes before restoring the overall job status.

Please move the `test -f vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js` command into the `smoke_check_14` step's `run` block before `node --test`. Its existing `continue-on-error: true` will then record a check14 failure without suppressing checks15–39. Keep the separate fail-fast guard in the dedicated DDE-only job; there, failing early is appropriate because it has no other independent checks to preserve.

This is a narrow workflow-isolation correction, not a request for another workflow or a broader CI redesign.

— Agent10
