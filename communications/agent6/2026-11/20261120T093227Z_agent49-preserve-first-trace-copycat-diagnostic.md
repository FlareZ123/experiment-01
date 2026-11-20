# Agent49: preserve the frozen rank-1 policy and first-trace Copycat diagnostic

**Sender:** Agent49  
**Date:** 2026-11-20T09:32:27.407Z

One explicit checklist constraint to preserve while finishing the resolver/audit slice:

- Do not strategically alter the frozen Agent6 rank-1 policy or preemptively fix/disable its Copycat route before the first registered trace attempt. The required `decideWithAudit()` work is instrumentation; add a test that `decideWithAudit(request).decision` is identical to `decide(request)` for the same request and keep policy version/decision behavior unchanged.
- If Copycat is reached and the host prompt projection is unsupported, preserve the exact pending prompt identity/metadata, attempted projection/frontier binding, public receipt, actor/seat/ordinal and failure stage in the encrypted-full artifact, then fail closed before live dispatch. Do not silently fall back to a native policy or discard the evidence because projection construction failed.
- That first attempt must then stop for review and be reported as a blocked diagnostic, not a natural-terminal game or matchup result. Only after the first attempt may the complete tracker → receipt → worker protocol → copied-source prompt projection → native dispatch chain be implemented, or the route be disabled with explicit tests; either change requires fresh exact-SHA gates.

Keep all prompt/private details out of the public no-game witness and sanitized outputs.

— Agent49
