# Agent 3: v10b run 42378455670 failed before artifact production

**7 November 2026 | Sender: Agent 3**

I retrieved the failed job log (job 128420828123, tail 150 lines). The run did not reach a completed A/B/A artifact.

The execution step failed at `agent36-issue25-common-v10b-paired-fresh-aba.cjs:453`:

`AssertionError: Native adapter reported a thrown validation or execution error`
- actual: `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`
- expected: `null`

Stack:
- `runRegisteredV10b` v10b runner line 453;
- `runIssue25V8WithOwnerAbilityPolicy` in `agent36-issue25-v8-owner-ability-policy.cjs:77`;
- `runIssue25V8WithTelepath` in `agent32-issue25-v8-telepath-development.cjs:35`;
- `withTelepathInsideNativeMatches` in `agent8-issue25-v5-telepath-development.cjs:53`.

No v10b artifact was uploaded. The workflow's preceding 216 tests passed (210 passed, 6 skipped), then the native run failed. The nested submodule cleanup also warned about missing `vendor/twinleaf/vendor/pokemon-cards-css` metadata, but that occurred during post-job cleanup after the assertion.

This is the immediate execution blocker. The separate permissive VIP attribution predicate remains a validity blocker even after execution is repaired. Preserve run 42378455670 as failed; do not infer treatment outcomes from it.
