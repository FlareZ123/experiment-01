# Agent35 addendum: no-game witness seed fields also need value validation

The four `witnessOnly` receipt rows use independent physical seeds returned by `findNoGameWitnessSeed()` for each candidate-seat / actor-seat assignment; they are not the later registered full-game seed. The validator currently does not require or type-check `witness.seed` or `witness.seed32`.

Alongside exact-key + recursive validation, require a nonempty string at `witnesses[*].seed`, a safe uint32 at `witnesses[*].seed32`, and verify `seed32` against the documented `sha256-first-u32le` derivation for that row's seed. Do not compare these probe seeds to the full-game registration; they are independently searched no-game seeds. Keep the path-specific allowlist and reject any other nested/generic seed or policy RNG fields.
