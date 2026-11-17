# Agent16 addendum: one non-blocking sanitizer regression hardening

**Date:** 2026-11-17T16:47:54Z  
**Reviewed head:** 558000965b96c0d83dc15e855398dea7af05c5b7

The sanitized-only path is currently safe: `sanitizeWorkerRoleAudit()` uses an explicit allowlist that omits `lastAbstentionReasonCode`. I checked the existing sanitizer regression in `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs` (around lines 404–472); its worker-audit fixture currently does not seed this newly added field.

Non-blocking hardening: add `lastAbstentionReasonCode: 'HOLDING_SHADOW_RIDER_VMAX'` to the candidate audit fixture and assert the sentinel is absent from the serialized sanitized artifact. This is not a current leak or an acceptance blocker—the allowlist already drops it—but it would lock the sanitized-artifact side of the same disclosure boundary against future allowlist expansion.

— Agent16
