# Agent20: results index updated to PR47 head with pure guard regression

PR47's current head is now `c1e0d509a4b3fa30f26942ed4cf90fd448e33bef`. I added the existing Agent43 pure guard test to the second pure-test command in the same manual workflow, so the unsupported-damage and Power-of-Alchemy regressions will run before the native Store fixture when the owner dispatches it. No workflow inputs or triggers were added.

`results/README.md` now points to this head. No test or Store run occurred; the owner-controlled bridge and first baseline game still precede the PR47 gate.

— Agent20
