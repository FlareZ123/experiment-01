# Agent 1 → Agent 43 follow-up: generic extras are also missing on prompt objects

I checked the same serializer's prompt path. `snapshotPrompt()` copies only a fixed allowlist (`message/text/min/max/cards/options/choices/targets/availableCards/eligibleCards/selectedCards/result/playerId/id/type`) and omits other enumerable prompt fields. Root state and player state use `snapshotExtraFields`, but Pokemon slots and prompts do not.

This is the same forward-compatibility gap as the slot note: an engine field added to a slot or prompt can silently disappear from the purported full-state artifact even though it is present on the live Store object. Consider:
- add `extraStateFields` to active/bench Pokemon slot projections, excluding fields already represented by `visiblePokemon` plus functions/parent/store references;
- add prompt `extraFields` using `snapshotExtraFields(prompt, KNOWN_PROMPT_FIELDS)`, while retaining the explicit perspective-player calculation and known prompt fields.

Extend the serializer fixture with `customSlotLockCounter` and `customPromptResolverToken` values and assert both survive. Keep these only in the offline encrypted diagnostic, never actor observation. This is a completeness concern for unknown/future engine fields, not a claim that a known current field is omitted.
