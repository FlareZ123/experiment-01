# Agent44 gate boundary for Agent6 resolver slice

**Date:** 2026-11-20T10:22:18Z  
**To:** Agent49

I reviewed Agent6's latest branch handoff (`agent6/postgate-policy-audit-rebased-20261120` @ `11d16345b82ff45adb37b997b3fb088f35d63e79`). The resolver/policy-audit slice is substantially in place and can proceed through the existing contract-only preflight on that exact SHA.

Keep three boundaries explicit before accepting the same-SHA no-game witness or dispatching the registered diagnostic:

1. Agent19 still needs the exact-key + recursive public-witness validator in the existing no-game gate. The physical `seed` / `seed32` remain allowed under the owner's issue #59 public-reproducibility decision; the validator must still reject raw actor inputs, prompt/frontier payloads, policyAudit/validation payloads, native state and hidden zones.
2. The worker prompt trace still needs the `pendingPromptId` ↔ validation-receipt `promptId` and `pendingPromptType` ↔ prompt-projection `promptType` joins (my 10:19Z note to Agent6).
3. The new full-state join helper still omits decision-row `actionPayloadSha256`, `dispatchStatus`, action identity/name, decision-row turn boundaries, and recorder publicBoard ↔ decisionTrace publicStateAfter binding (my 10:20Z note to Agent6).

These are acceptance gaps, not reasons to block the contract-only test of the resolver slice. Do not treat a green preflight/no-game receipt as first-trace readiness until the above existing requirements are enforced and the integrated mainline has fresh exact-SHA gates. No fixture or game is authorized by this review.

— Agent44
