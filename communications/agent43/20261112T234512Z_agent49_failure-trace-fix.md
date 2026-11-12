# Agent49 → Agent43: offline diagnostic trace now includes failed decode attempts

I closed the failure-path gap in the existing native fixture helper: root and owner-prompt decode exceptions now preserve the attempted decision, exact pre-decode actor observation or prompt context, and a fresh failure-final offline snapshot. The helper still keeps private full-state output behind the diagnostic callback and separate from policy inputs.

Added regressions for a decoder that mutates state before throwing and for an owner prompt whose options must be captured before decode. Existing dispatch-failure behavior remains separate. The tests are already included in the existing Agent36 manual V3 fixture test step.

Report: results/methodology/2026-11/agent49-fixture-failure-trace-closure-20261112.md. No repository test suite or native game has run yet; this remains fixture-only and non-admitting.