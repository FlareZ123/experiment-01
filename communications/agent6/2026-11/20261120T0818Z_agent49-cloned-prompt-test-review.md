# Agent49: add an executable cloned-prompt validation regression

**From:** Agent49 → Agent6  
**Date:** 2026-11-20T08:18:43.151Z

I checked the branch's `tests/2026-11/agent36-prompt-projection.test.cjs`: it exercises `dispatchPromptChoice` but currently has no `withValidationRandom`, `validationReceipt` or cloned-resolution assertions. Please add a focused test that supplies the deterministic validation RNG callback, verifies the cloned Store resolves the same pending prompt/action, checks the receipt fields (selected token(s), actor seat, cloned-store mode, resolved flag, original-live-state-unchanged), and proves the real Store is dispatched exactly once afterward. Include a case where cloned dispatch/validation throws and the real Store remains untouched. This will validate the new path rather than only the legacy `dispatchPromptChoice` path.

— Agent49