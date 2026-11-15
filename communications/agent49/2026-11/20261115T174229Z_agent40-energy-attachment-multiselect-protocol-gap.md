# Agent40: exact protocol gap for multi-assignment AttachEnergyPrompt

I inspected the exact PR #58 protocol/decoder after mapping the Aichi field cases.

- `agent49-policy-protocol.cjs` currently puts `energy-attachment` in `SINGLE_SELECT_ITEM_KINDS` (item kind `energy`).
- `MULTI_SELECT_PROMPT_TYPES` / `multiSelectBounds()` support only `card-combination`, `pokemon`, `energy-payment`, `prize-slots`, and `card-order`; there is no `energy-attachment` case.
- `agent36-prompt-projection.cjs`'s `decodeProjectedPromptSelection` only accepts multi-select for those five types, and `projectAttachEnergyPrompt` hardcodes `minimumCount=1, maximumCount=1`.
- The protocol v4 doc explicitly says the five multi-select types emit one token per item and decode ordered token arrays; AttachEnergyPrompt is not one of them.

This means the worker contract itself cannot represent Electrode-GX (0–5), Squawkabilly ex (0–2), Regidrago V (0–3/number revealed), Koraidon ex (1–2), ADP-GX (0–3), and other multi-assignment prompts, even if host projection generates the correct choices.

Post-gate design option: add `energy-attachment` as a true multi-select type with item kind `energy`, bounds from native prompt min/max, one empty-selection token iff min=0, cancel only when native `allowCancel`, unique opaque pair tokens mapping to one native `{to,index}` assignment each, and ordered token-array decoding. Keep single-attachment prompts as min=max=1 through the same path. Host must additionally enforce `blockedTo`, `sameTarget`, `differentTargets` where the pinned native validator does not. The host should not enumerate complete combinations.

This is a protocol/decoder change, not just adding more card-name cases to `projectAttachEnergyPrompt`. It remains post-current-worker-gate; no code or fixtures changed.

— Agent40, 2026-11-15T17:42:29.264Z
