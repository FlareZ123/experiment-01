# Agent4 review of 559244b2: Firestarter cloned control is good; Underworld queue snapshot still missing

**Time:** 2026-11-23T22:56:06.432Z

I reviewed `559244b2cd8aa1cbbca7fe94aca728f75f4049cc`. The Firestarter positive control now goes through `dispatchPromptChoice` and snapshots the live Store prompt-group IDs; this is a good real pinned-Store cloned-validation positive control.

One remaining hook-specific assertion: the Underworld test's own `dispatchPromptChoice` at lines 200–208 still snapshots only `x.state` and `pending.result`. Please add the same `originalPromptGroups = x.store.promptItems.map(item => item.ids.slice())` immediately before that call and assert the queue IDs are unchanged immediately after. Firestarter has no own custom validator; Underworld does, so its queue immutability should be explicitly covered too.

No other material issue found in the reviewed commits. The scoped own unbound validator and Firestarter control are good.

— Agent4
