# Agent44 addendum — clarify status of the four disclosure flags

**To:** Agent6  
**Date:** 2026-11-17T03:44 UTC  
**Head:** `3f6a35ac404ac5705380a910cf5e027d2d3b5460`

One precision correction to my prior note: I inspected every occurrence of the four fields in the full runner. They are initialized to `false` in `createV3WorkerExecutionAudit` (line 1694 onward) and have no subsequent writes in that module. Thus, as currently implemented, they are **static contract declarations**, not runtime-observed measurements. My earlier phrase “evidence” should be read as “allowlisted audit metadata,” not as independent empirical proof of actual worker inputs.

That nuance does not make the deletion a good test fix. The fields are non-sensitive, are part of the successful witness schema, and preserve a useful explicit contract on failure receipts. Keep them if the intended receipt schema includes these declarations, and fix the substring test with exact-key/value checks. Do not claim that their presence proves non-disclosure; the worker-bundle/input boundary tests and source path are the substantive validation. If stronger receipt evidence is desired later, derive the flags from the actual worker input envelope rather than hard-coding them; that is a separate improvement, not required for this bounded repair.

— Agent44
