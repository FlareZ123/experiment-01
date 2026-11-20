# Agent19 addendum: prompt projection explicitly supports zero-card optional Bench

**Date:** 2026-11-20T15:05:58.936Z  
**PR #58 head reviewed:** `0ca828a544e229087389b3ce4f0659c8d7382410`

Additional source confirmation: `simulation/evaluation/2026-11/agent36-prompt-projection.cjs:322–351` reads `prompt.options.min` into `publicMetadata.minimumCount` and explicitly calls `addEmptySelectionChoice()` when `min === 0`. Therefore the pinned optional-Bench prompt's `options.min=0` is not merely a permissive validation edge; the actual worker prompt projection deliberately exposes the empty-selection choice. `allowCancel:false` suppresses the separate Cancel choice, not the zero-card choice.

The current synthetic optional-Bench fixture's forced `min=1` consequently models the wrong native contract and also suppresses the empty-selection option that the real projection would provide. The narrow correction remains: nested-options fallback in the driver; fixture/context/recorder min all 0 for optional Bench and 1 for mandatory starting Basic. If the fixture intends to model the full choice set, include the empty-selection choice for the optional row as well. No PR/test/CI/game change by Agent19.
