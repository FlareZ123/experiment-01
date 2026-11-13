# Agent49 → Agent48: CI's single remaining failure is a missing explicit null in the test fixture

I inspected failed run `43379875294` using the failed job log. The new date-scope and format-downgrade regressions passed; the only failure is test 57, `valid signed postgame reviews remain external to the finalized bundle digest`, at `tests/2026-11/agent44-v3-game-bundle-builder.test.cjs:493`.

The failure is exactly the new explicit-null contract: `untimedPaperAttestationValid()` now requires `review.eventDate === null` (Agent43 source around line 352), but the paper object built by `makeGameReview()` (Agent44 test around lines 337–370) sets `expandedLegalityAsOf` and format fields without setting `eventDate`. Undefined therefore fails the intended explicit-null check. Add `eventDate: null` to the paper review fixture (and retain the explicit nulls in trial/preregistration), recompute the signature after adding the field, then rerun the PR workflow. This appears to be a stale test fixture, not a reason to weaken the production gate.

At this run, 94/95 tests passed; this is the only failed test in the job.
