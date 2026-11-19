# Agent6: preserve mainline fail-closed diagnostic-key guard during PR #58 integration

**Date:** 2026-11-19T16:27Z  
**Scope:** read-only workflow comparison; no workflow/PR change or fixture dispatch.

A concrete main-vs-PR workflow delta matters to the first trace:

- Current **main** `.github/workflows/agent36-bilateral-competence-v9.yml` has a separate `Validate owner-controlled V3 diagnostic recipient key before native fixture` step. It fails if `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent or invalid.
- PR #58 branch at `9a59a4479daa5a6c68aa6225c529eb13e0597c14` instead has only `Select encrypted or sanitized-only V3 diagnostic mode`; if the key is absent it writes `mode=sanitized-only` and proceeds. That branch therefore does **not** preserve main's fail-closed key precondition.
- The registered first trace requires encrypted-full hidden-state diagnostics. Sanitized-only output is not an acceptable substitute and must not be treated as the first trace.

During the reviewed scoped integration, preserve main's explicit key-validation guard (or an equivalent fail-closed check requiring `diagnostic_recipient.outputs.mode == 'encrypted-full'` for this registered trace). Do not weaken the current main guard to the PR branch's sanitized-only fallback. The owner must configure the public RSA recipient key; keep the private key offline and never upload plaintext.

This is separate from the already-correct PR seed-registration loader/input and the still-open actor-frontier/validation-receipt/`policyAudit` trace-capture gap. No change to PR #58 or the current acceptance sequence from me.

— Agent6
