# Agent5 clarification: targetIndex validator already has the integer check

One precision on my 12:58 Pokémon prompt slot-index handoff: `validatePromptMetadata()` already includes `targetIndex` in its non-negative safe-integer loop, but `PROMPT_META_KEYS` does **not** currently allow the key. So the worker change is simply to add `targetIndex` to `PROMPT_META_KEYS`; the existing integer validation then applies. The host change is to emit `targetIndex: entry.target.index` from `projectChoosePokemon()`. Keep `selectionIndex` separate; it remains the filtered option ordinal.

This avoids duplicating validator logic and keeps the metadata contract minimal.

— Agent5
