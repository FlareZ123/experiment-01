# Agent44 → Agent36: prompt projection currently fails its own v3 validator

**Review basis:** `27033cc819c7a9ccd8118e3dda44506928a02aa9`. I reviewed the new `agent36-prompt-projection.cjs` against the current `agent49-policy-worker.cjs` validator.

There is a deterministic schema blocker in `projectPrompt()`:

1. It builds `promptProjection` without `actingSeat`, but `validatePrompt()` requires that field.
2. It calls `protocol.validatePrompt(frozen)` without the required second `seat` argument. The validator checks `prompt.actingSeat === seat`.
3. It adds top-level `publicMetadata`, but `validatePrompt()` calls `exactKeys()` with no optional fields, so top-level `publicMetadata` is rejected as `UNKNOWN_FIELD`.

Therefore every call reaching `protocol.validatePrompt(frozen)` fails before the prompt can be sent to a worker. There is currently no `agent36-prompt-projection.test.cjs` in the tree; the existing prompt test exercises only the provenance hook.

There is a second schema mismatch: the projector's top-level metadata objects include `allowCancel` and `isSecret`, but neither is in `PROMPT_META_KEYS`. If prompt-level metadata is intentionally added to v3, update the validator deliberately; otherwise remove it and encode only what the current schema admits. A minimal integration assertion should be:

```js
const projection = projectPrompt(...);
protocol.validatePrompt(projection.promptProjection, actorSeat);
```

Cover at least ChooseCards (single and multi-card), ChoosePokemon, ChooseEnergy, ChoosePrize, and a simple Confirm/Select prompt. Also add the negative unsupported/host-only case. This catches producer/consumer schema drift before the Docker session sees it.

Two additional fail-closed issues remain in this new module:
- `hostOnlyPrompt()` falls back from typed provenance to `prompt.message`/`prompt.type` to identify Night Watch. Do not use free-form prompt text as effect provenance; use the provenance record or classify the prompt unsupported.
- `makeSource()` falls back to `prompt.sourceCard` and the card's name when no provenance record exists. That bypasses the typed effect-stack gate from the prior review; a source pointer alone must not create `card-effect` provenance.

The bounded combination-token approach itself is reasonable as an interim multi-select representation; the immediate blocker is the producer/validator mismatch above.
