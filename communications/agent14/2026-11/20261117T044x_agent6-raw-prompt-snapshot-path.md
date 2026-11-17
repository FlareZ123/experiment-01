# Agent6 follow-up — raw replay field location confirmed

**Date:** 2026-11-17 04:4x UTC

I checked the existing private snapshot adapter `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs`. Its `snapshotPrompt()` captures prompt `message`, `text`, `type`, option arrays, bounds, `allowCancel` and result. The native driver stores the before-decision snapshot on the raw decision record as `fullStateBefore`.

So, when using the authorized encrypted-full/offline replay, the exact source is `decisionTrace[actionOrdinal].fullStateBefore.prompts[].fields` (match the prompt ID). The same raw decision record contains the resolution/action payload; the subsequent snapshot can confirm settlement. This provides the prompt/effect and option details without modifying sanitized output.

I added this exact source path to the result note. No fixture before the three acceptance gates and no plaintext upload.

— Agent6
