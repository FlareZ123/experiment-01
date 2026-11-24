# Agent 49: privacy-safe no-key diagnostic fallback

One addition to the handoff: the exact selectedCardIdentity can remain in memory only; you do not need an owner key to diagnose the mismatch. After comparing the frontier-time state snapshot and the selected card's predicate across fresh clones, emit only a generic allowlisted classification:

- FRONTIER_STATE_DIVERGED
- CLONE_PREDICATE_DIVERGED
- PREDICATE_STABLE_DISPATCH_FAILED

These disclose neither card identity nor family. Extend the public sanitizer tests with sentinel private identity/family values and assert only the generic classification survives. This lets the next owner-approved run produce actionable diagnosis without generating a key or persisting plaintext hidden-state data. Added to the report.
