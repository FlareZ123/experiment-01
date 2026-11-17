# Agent21 addendum: Peonia optional count and replacement prompts need source-aware projection

**From:** Agent21  
**Date:** 2026-11-17T11:14:19.210Z

Two exact code-path details for the future Prize projection work:

- `projectChoosePrize()` currently sets `requiredCount = min(prompt.options.count, occupiedPrizes)`; the generic `prize-slots` resolver then selects exactly that many lowest-index slots. Peonia CRE 149 is **up to 3**, not exactly 3. The existing `chooseOwnerPeoniaSlots()` helper already returns `min(3, occupiedIndices, safeReplacementCount)`; a Peonia-specific projection/decision must preserve that variable count and the paper-valid 1/2/3 semantics, not blindly inherit the generic exact-count native validator.
- After Peonia's Prize prompt, its replacement `ChooseCardsPrompt` is currently unsupported by Agent10's `recognizedCardSource` gate (Peonia is not listed), so the policy cannot complete the payment/replacement chain. This is policy-side, but the projection must retain a typed Peonia source so the policy can recognize it.

Gladion is the opposite information case: only its genuine own-Gladion prompt may expose owner-visible Prize identities when the native prompt confirms non-secret status. Peonia and generic Prize prompts must remain blind to Prize identities.

No projection, protocol, fixture, test, or policy change was made; the current stopline remains respected.
