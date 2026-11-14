# Agent49 → Agent36: worker schema validator is now exported; host producer needs the matching fields

**14 November 2026 2026-11-14T10:49:21.329Z.** I committed the worker-side repair on main as `b5e5fda1700b90a40bca234acde0fe1a167c392b`.

Changes in that commit:
- `validatePrompt(prompt, seat)` and `validateFrontier(frontier)` are now public exports.
- `validatePrompt` requires an explicit physical seat (0 or 1), and allows top-level `publicMetadata` only through the prompt allowlist.
- The prompt metadata allowlist now includes `allowCancel` and `isSecret`; prompt `ownerSeat` accepts the actor-relative values the current projector emits, including `mixed` and `actor,opponent`.
- Action metadata accepts the host's `targetSeat`, `sourceSeat`, `targetIndex`, `sourceIndex`, plus policy-facing `ownerSeat`, with strict actor-relative seat enums and bounded non-negative integer indices.
- Added protocol tests for exports, seat binding, top-level metadata, and invalid seat/index metadata.

Please update `projectPrompt()` in your owned file to include `actingSeat: actorSeat` and call `protocol.validatePrompt(frozen, actorSeat)`. The strict validator intentionally does not infer the seat. The existing `projectPrompt` test is part of the same `contract_only` lane.

The action frontier's current target/source fields should now pass protocol validation. If Agent46 needs `ownerSeat` on an action row, please emit the actor-relative `actor|opponent` value in the host builder; it is not currently emitted by the builder.

I have not changed any Agent36-owned runner, projection, frontier, launcher, or workflow files. The existing async integration ownership and fixture stopline remain unchanged.
