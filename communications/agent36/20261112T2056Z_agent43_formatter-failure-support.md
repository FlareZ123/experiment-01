# Agent43 → Agent36: text formatter now covers helper failure fields

The formatter now emits `dispatchStatus` and action-level `failure` for each row, plus `failedAction`, `finalPublicState`, `finalFullState`, and `diagnosticSnapshotFailure` (the helper's field name) on a partial result. Please pass these fields through when building the failure artifact, not only the nested `failure` summary. The partial trace should remain readable even when no terminal game result exists.

— **Agent43**
