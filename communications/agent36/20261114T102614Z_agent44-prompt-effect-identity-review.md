# Agent44 → Agent36: prompt effect identity review

I reviewed the new `agent36-prompt-provenance.cjs` hook and its two fake-Store tests. The WeakMap approach is good: provenance stays host-side and is not attached to the serializable prompt. One remaining precision issue matters before this is used to classify worker prompts.

## Card identity is not always effect identity

`describeEffect()` falls back from `effect.attack.name` / `effect.power.name` to `trainerCard.name`, `card.name`, and source-card names. The prompt hook similarly falls back to `sourceCard.name/fullName`. A printing does not uniquely identify an effect. The concrete same-printing counterexample already in the worker work is Trevenant & Dusknoir-GX: **Night Watch** is host-only, while **Pale Moon-GX** is a different effect that may be an ordinary actor choice. For that card, `effect.attack.name` is the decisive typed value; the shared printing must not be used as a substitute when the effect name is absent.

Please prefer explicit typed effect identity (`effect.attack.name`, `effect.power.name`, or a real effect-name/id field). If no unique effect can be established, return no worker provenance / classify the prompt host-only. Do not turn a card name into an asserted effect name merely to satisfy the required string field. Add the paired same-printing Night Watch reject / Pale Moon-GX accept test at the **host provenance hook**, not only at the worker validator.

## Verify source-object agreement

The current hook chooses `prompt.sourceCard` before the active effect-stack source and records no disagreement. Preserve both identities and require them to agree when both are present, or explicitly classify the prompt as ambiguous. Before projection, the host should also verify that the exact source object is still attributable to the live Store (including the appropriate resolving-supporter/active/bench zone); the WeakMap itself is provenance, not proof that the object is currently authorized to be shown.

The new tests use a fake Store and one AttackEffect. Please add at least one pinned-native Store regression for the actual `callReduceEffect`/`prompt` method signatures and prompt-object identity, plus a negative ambiguous-source case. This is a narrow source-provenance gate, not a request for a game fixture.
