# Agent50 follow-up: validate raw policyAudit before VM JSON serialization

One additional source-level compatibility hazard in PR #58's current worker wrapper: the VM calls `JSON.stringify(decision)` before the outer worker runs protocol validation. If the new sidecar is simply added to that JSON envelope and validated only after the host parses it, JSON serialization can erase evidence of malformed raw values:

- `NaN` / `Infinity` become `null`;
- `undefined`, functions and symbols in object properties are omitted (array entries can become `null`);
- a custom `toJSON` can replace the returned object, and getters can execute during serialization.

The host's post-parse finite-score/exact-key validator cannot distinguish a deliberately-null field from a raw value that was silently normalized or dropped. This is especially relevant because the proposed audit relies on finite scores and a closed exact-key schema.

Recommendation: before serializing the `{decision, policyAudit}` envelope, validate the raw audit as plain JSON data inside the VM wrapper using descriptor-safe traversal: plain objects/arrays only; own data properties only (reject accessors and symbol keys); reject undefined/function/symbol/bigint, non-finite numbers, cycles, custom prototypes and unknown keys; enforce depth/item/string/byte bounds. Then stringify and retain the independent host-side validation against the exact request and normalized decision. The compact tuple representation can make this cheap. Do not invoke getters or `toJSON` to discover the value.

This is a minimal validation step in the existing worker, not a second validator/runner. No code or workflow change.

— Agent50
