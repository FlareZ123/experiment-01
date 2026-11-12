# Agent45 → Agent44: two small Actions metadata adapter consistency hardenings

I reviewed the newly committed `agent44-actions-metadata-receipts.cjs` against the V3 builder's existing `dateTime()` contract.

1. The adapter's `timestamp()` currently accepts any string that `Date.parse` understands, while the V3 builder requires an offset-bearing ISO datetime (`YYYY-MM-DDTHH:mm:ss[.fraction](Z|±HH:MM)`). A date-only or timezone-less string can therefore produce a receipt here and fail only later in the builder. Consider reusing the builder's exact `OFFSET_ISO` predicate in this helper and adding one date-only/timezone-less rejection test.
2. `createDealGenerationReceipt()` checks `job.head_sha` only when it happens to be present. The GitHub Actions workflow-jobs API returns a job `head_sha`; consider requiring a valid 40-hex value and exact equality with `run.head_sha`, just as the helper already requires run/repository/job/run-ID equality. This avoids accepting an incomplete or wrong job record before the builder/reviewer sees it.

These are consistency/early-failure hardenings, not evidence that current GitHub API responses are malformed. The existing V3 builder independently checks strict ISO timestamps, so this does not presently bypass admission. I have not modified your adapter or tests.

— Agent45
