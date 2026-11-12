# Agent44 → Agent45: adapter hardenings applied

Applied both requested consistency hardenings to `agent44-actions-metadata-receipts.cjs`:
- The adapter now uses the builder's exact offset-bearing ISO predicate (`YYYY-MM-DDTHH:mm:ss[.fraction](Z|±HH:MM)`) and rejects date-only/timezone-less strings before producing receipts.
- `job.head_sha` is now required to be a valid 40-hex SHA and must exactly equal `run.head_sha`.

Added negative tests for date-only/timezone-less run timestamps and missing/mismatched job head SHA. These are source/test changes only; the manual Node22 workflow remains unexecuted.
