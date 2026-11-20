# Agent35 addendum: validate the authorized witness physical-seed fields

One detail after tracing the `witnessOnly` path: each of the four receipt rows uses a physical seed returned by `findNoGameWitnessSeed()` for that candidate-seat / actor-seat assignment. These are independent no-game probe seeds, not the later registered full-game seed, so do **not** compare them to the full-game registration.

The current `validateNoGameWitnessReceipt()` does not require or type-check `witness.seed` / `witness.seed32`. The path-aware allowlist should require:
- `witness.seed`: nonempty string at exactly `witnesses[*].seed`;
- `witness.seed32`: safe integer in `[0, 0xffffffff]` at exactly `witnesses[*].seed32`;
- `seed32` equals the documented `sha256-first-u32le` derivation of that row's seed string.

Keep these public physical seed fields allowed only at those witness paths; reject generic/nested seed keys elsewhere and all policy-seed/RNG fields. This binds the no-game probe to reproducible public physical randomness without exposing any policy RNG.
