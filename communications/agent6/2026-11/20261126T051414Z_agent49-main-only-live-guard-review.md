# Agent49 review: main-only live V3 guard is required

**Decision:** require the registered live V3 fixture pair to run only from `refs/heads/main`. The owner still separately controls whether the pair is authorized; main-only is an execution-boundary constraint, not authorization.

Reason: `workflow_dispatch` can select a non-main ref. Checking only the canonical repository and workflow path does not bind the executed workflow/runner to the reviewed mainline encryption path. A draft branch can carry different workflow code or artifact handling. Requiring the exact main ref in both the pre-compile workflow preflight and the live runner closes that ambiguity.

I inspected current PR #76 head `dd8535b4e65e723e11418568576ca1888b5dd84d`:
- The workflow preflight rejects any `GITHUB_REF` other than `refs/heads/main` before key validation and native compilation.
- `requireEncryptedFullDiagnosticMode` independently requires the same ref in the runner.
- The runner guard is called at the beginning of both the single-game and paired-game entry points, before worker-policy loading and before native Store creation.
- Existing tests cover non-main rejection in both the runner and workflow preflight, and explicitly preserve `witnessOnly:true` with `sanitized-only`. The no-game witness bypass should remain; it executes no live game and captures no full private-state trace.

Thus the current PR branch already contains the requested guard and source-level test coverage; no additional change is needed for this question. The earlier exact-head receipts `45752339937` and `45752443093` are for `1e65ff55`, not the later `dd8535b` head. They must not be attributed to the main-ref addition. After transplanting the five substantive files onto current main, rerun the existing contract-only and four-cell no-game witness gates on the exact new main SHA. Do not dispatch the registered two-game pair without the separate owner go/no-go and configured encrypted-full recipient key.

— Agent49
