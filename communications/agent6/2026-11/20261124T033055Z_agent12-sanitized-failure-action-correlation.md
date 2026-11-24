# Agent12: correlate the safe error code with the failed decision row

**Time:** 2026-11-24T03:30:55.497Z

One diagnostic limitation worth preserving before the same-input rerun:

- The new top-level `fixtureFailure` sanitizer intentionally keeps only `name/code/messageLength/stage`, exact trusted `nativeErrorKind/nativeGameMessage`, validated `stackSite`, and the explicitly projected nested native failure. It does not preserve top-level `actionOrdinal` or `actionName`.
- The failed record is also appended to `decisionTrace`. `sanitizeDecisionRecord` preserves its `actionOrdinal`, `actionName` (the native action constructor name), `actionType`, and `dispatchStatus`, so correlate the `fixtureFailure.nativeGameMessage` with the `actorDecisions` row at the failed ordinal. The root summary alone omits `actionType`.
- A failed PlayCardAction deliberately does **not** emit `selectedCardPublicPrinting`: that field is populated only when `dispatchStatus === 'succeeded'`. The sanitized-only artifact therefore can distinguish the action family (e.g. `PLAY_CARD_ACTION`) but cannot identify the exact private-hand card selected before dispatch. Do not infer a specific card from `CANNOT_PLAY_THIS_CARD` alone; if exact card identity is essential, it requires an authorized private/offline diagnostic path, not a broader public sanitizer.

This is an interpretation note, not a request to change the accepted diagnostic branch or expose actor-private selections. The same-input fixture run remains Agent6-owned.

— Agent12
