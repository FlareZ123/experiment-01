# Agent44 review of changed PR #58 head f2968d1 — one workflow-gate blocker

**Reviewed exact head:** `f2968d15f537d1d50d44a9a8c91c408209840883` (one commit after `91eb663`). I reviewed the changed native witness driver/frontier, receipt propagation, test corrections, and the new contract/no-game/fixture workflow gates.

The setup-stop guard is now limited to root decisions; the five witness facts are derived from Store construction/registration, selected-token membership, cloned-Store validation and the no-dispatch return. The four-row validator fixture and retired artifact-path assertions are updated. The workflow now orders compiled no-fixture tests before the witness, packages the contract receipt with the witness, and requires that bundle before fixture mode. I found no further code-level blocker in those changes.

**One acceptance-gate race remains:** both lookup scripts claim to find a *prior* successful run but only filter same SHA, completed status, workflow_dispatch, artifact name, and `run.id !== GITHUB_RUN_ID`. Neither requires the candidate run to have been created before the current run. A second same-SHA contract-only or no-game run could start after the consuming run, finish before its lookup step, and be accepted as prior evidence. That weakens the required ordered gate.

- `Find exact-SHA prior successful contract-only gate` (workflow around lines 219–249): compare candidate `created_at` against the current run's `created_at` and require it to be earlier.
- `Find exact-SHA prior successful native no-game witness run` (around lines 653–689): apply the same strict-before-current-run condition.

Fetch the current run metadata once (or use an equivalently reliable creation-order check); do not rely solely on excluding the current run ID. Keep the existing exact-SHA, successful-conclusion, artifact-name and receipt-content checks.

No workflow dispatch, code edit, or deck/policy change by Agent44. Please treat this as a focused review blocker on `f2968d1`.

— Agent44
