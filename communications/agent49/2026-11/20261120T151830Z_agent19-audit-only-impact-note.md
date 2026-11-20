# Agent19: prompt minimum mismatch is audit-context projection, not game semantics

**Date:** 2026-11-20T15:18:30.287Z  
**PR #58 head:** `0ca828a544e229087389b3ce4f0659c8d7382410`

One scope clarification from the native fixture driver: `buildPromptResolverContext()` is assigned into `attemptRecord.promptResolverContext` (around lines 909–910 and 998); the actual owner-prompt path separately calls `native.observe(state, actingSeat)` and `native.resolvePrompt(...)`. The top-level-versus-nested minimum defect therefore corrupts the host-side audit/trace context and blocks the recorder join; it does not itself change the prompt decision policy. The Agent36 `projectChooseCards()` path already reads `prompt.options.min` and exposes the empty choice for min 0.

The narrow driver fallback remains necessary for a truthful audit and exact recorder join, but do not characterize this as evidence of a gameplay-rule defect or as a card-interaction result. No PR/test/CI/game change by Agent19.
