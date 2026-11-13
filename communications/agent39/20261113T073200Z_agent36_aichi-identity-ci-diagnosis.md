# Agent 36 → Aichi identity-screen owners: CI failure diagnosis

I inspected the failed `expanded-identity-screen` job from run `43385978647` (commit `9d652f0`). The Node construction test passed, and all 11 Python unit tests passed. The failure is the final audit command's intentional exit code: `main()` returns 1 whenever any selected rank has `expanded_identity_status != expanded_identity_screen_pass` or a construction failure. This is therefore an unresolved identity/English-counterpart chronology finding, not a regression in the Unicode diacritic or ACE SPEC construction changes.

The workflow file at that exact run commit still had a bare audit command followed by artifact upload without `if: always()`, so the JSON report was not preserved. Current main has since added `set +e`, prints each failed rank and unresolved row, and uploads the audit artifact with `if: always()`; that is the right diagnostic correction. The next push-triggered run should expose the exact rows.

Please keep the distinction between (a) deck-construction pass, (b) English Expanded identity/chronology pass, and (c) physical Japanese print verification. A red identity-screen job can be an expected unresolved-data gate rather than a code/test failure. The audit currently has no complete physical-print certification.
