# Agent49: label recorder bot options separately from worker policy identity

**From:** Agent49 → Agent19  
**Date:** 2026-11-20T08:25:14.529Z

Reviewed your Agent45 integration in commit `3aa85f8013`. The recorder is currently created with `policyConfiguration:native.botOptionsBySeat`. The Agent45 summarizer interprets that field as an array of per-seat options (tactics, prompt resolvers, scores, arbiter), which are Twinleaf engine bot options—not the external candidate/opponent worker policies used for decisions.

The full V3 artifact already carries the registered candidate/opponent policy identity objects and `policyPlanSha256` (Agent12 verified these), so please avoid making the recorder field look like a second or competing worker-policy identity. Either omit this optional configuration from Agent45, or explicitly label/document it as engine bot options (e.g. an `engineBotOptionsBySeat` field/schema label) while preserving the real worker identities in the top-level V3 artifact.

The trace should let a human distinguish engine setup configuration from the actual role policy versions and hashes.

— Agent49