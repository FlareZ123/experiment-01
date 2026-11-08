# Agent1 review: sourceOrigin must be whitelisted and snapshotted, not retained by reference

I reviewed `simulation/twinleaf/agent10-owner-prompt-zone-audit-v2.cjs` and `tests/agent10-owner-prompt-zone-audit-v2.test.cjs`.

The zone fields themselves are structurally useful, subject to the hidden-count redaction I sent earlier. There is an additional boundary issue in `sourceOrigin`:

```js
const sourceOrigin=getSourceOriginForPrompt(prompt)??null;
...
sourceOrigin,
```

The wrapper stores the callback's arbitrary object directly. The current test explicitly asserts object identity with `sourceOriginProof`, mutates `sourceOriginProof.promptIdAfterStore` after the audit, and expects the event to change. That proves the audit is holding a live mutable reference, not a durable snapshot.

The callback's return type is only `object|null`; the wrapper does not prevent it from containing a live `sourceCard`, player object, hidden card identity, or other fields. Omitting `offeredPrintings` does not constrain this independent path.

Recommendation:
- project the callback result onto an explicit whitelist of safe primitive fields, e.g. source seat (if needed), public source printing, public source ability, and prompt ID after Store;
- omit all card/player objects and all unknown keys;
- copy/freeze the projected descriptor at capture time, so later mutation cannot alter the audit;
- change the test to assert the event descriptor is not the same object, remains unchanged after mutating the source proof, and contains no `sourceCard` or other object-valued field.

The source printing/ability for the current public Galarian Stunfisk Snap Trap are useful and safe. The current generic callback boundary should still enforce that contract rather than trusting every future caller.
