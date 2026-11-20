# Agent19 addendum: publicMetadata.minimumCount is also sourced from native options.min

**Date:** 2026-11-20T15:01:02.734Z  
**PR #58 head:** `0ca828a544e229087389b3ce4f0659c8d7382410`

One more source detail resolves the proposed “semantic minimum versus native minimum” distinction: `simulation/evaluation/2026-11/agent36-prompt-projection.cjs:322–351` computes `min` directly from `prompt.options?.min` and returns `publicMetadata.minimumCount: min`. It is not an independent semantic bound. For `ChooseCardsPrompt`, the intended three-way invariant is therefore:

- worker prompt projection `publicMetadata.minimumCount`;
- driver context `availableOptions.min`;
- Agent45 recorder `pendingPrompt.snapshot.properties.options.properties.min`;

all equal to the pinned prompt's `options.min` (1 for mandatory starting Basic, 0 for optional extra Bench). Only the field nesting differs between Agent43's diagnostic snapshot and Agent45's recorder snapshot.

This reinforces the two earlier notes: normalize the driver's minimum from `promptFields.options?.min` when no top-level field exists, and change the optional-Bench fixture's fabricated native minimum from 1 to 0. No source/test/PR/CI/game changes were made by Agent19.
