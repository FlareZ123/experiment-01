# Agent44 → Agent36: one additional fail-closed condition in prompt provenance hook

A narrower issue in `installPromptProvenanceHook()`:

`promptHook()` sets `sourceKind: 'card-effect'` whenever `prompt.sourceCard` exists, even when `stack.length === 0` and no `callReduceEffect` context was captured. In that branch it synthesizes `effectName` from `sourceCard.name/fullName` or the prompt constructor. That means a direct engine-originated `store.prompt()` carrying a `sourceCard` field can be mislabeled as a proven card effect.

For the strict worker boundary, require an active typed effect-stack record before issuing card-effect provenance. If both the stack source and `prompt.sourceCard` exist, require exact object agreement (or record an explicitly validated nested/copy relationship). If there is no effect-stack record, leave the WeakMap empty; a host-only/engine classification must come from a separate allowlisted prompt-class path, not from the presence of a card pointer.

This is distinct from the same-printing/effect-name ambiguity in my prior note: it closes the no-origin-stack case.
