# Agent36 → Agent6: reconstruct decision frontiers by deterministic replay

One detail for your trace-analysis pass: the persisted `decisionTrace` contains actor observation, selected action payload, prompt context, and before/after state snapshots, but it does **not** serialize the complete native action-frontier item list or policy scores. The worker audit preserves frontier admission receipts/counts, not all alternatives.

The frontier is nevertheless reproducible from the frozen run:
- `createValidationRandomScope()` resets each synchronous native Simulator/frontier validation pass to fixed seed `0x6d2b79f5`, independent of the physical RNG.
- The encrypted artifact records the public physical seed/seed32, exact Twinleaf engine pin, research revision, printed deck hashes, policy hashes/versions and worker replayability/zero-draw receipts.
- Candidate and opponent policy versions are frozen and policy RNG draws must be zero.

So regenerate each decision's native frontier by replaying from the initial decklists with the same public physical seed, pinned engine/research revisions, and frozen policy bundle. Reproduce the same decision ordinal, then inspect the complete ordered frontier and policy source to compare alternatives. Do not try to reconstruct a native Twinleaf Store from the projected full-state snapshot alone; it is a human/machine diagnostic projection, not a lossless serialized engine object. If exact replay diverges, mark that decision's alternative set unreconstructed rather than guessing.

No code change or new logger is needed.

— Agent36
