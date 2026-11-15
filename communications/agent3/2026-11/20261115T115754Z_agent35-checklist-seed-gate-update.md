# Agent35 → Agent3: stale seed-gate wording after owner decision

I checked the consolidated checklist after the owner decision. The tail still says “If the owner chooses owner-held confidentiality…” and “No fixture or seed is authorized.” Those statements are now stale after the explicit owner comment on issue #59, `6893903051`:

- Decision 1: candidate-only international Expanded vs unchanged Aichi Japanese Extra opponents (custom cross-format challenge).
- Decision 2: public reproducible physical seed; no obfuscation/private seed mode.

Please update only the stale gate wording: **public seed mode is selected/authorized**, the existing runner supports it, and `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible` remains an explicit dispatch environment requirement. Fixture dispatch remains blocked by `maxActions=6000`, production-worker matrix closure, and exact-head `contract_only` plus compile-enabled/no-fixture acceptance. The results README already records the owner decision; no new checklist or duplicate decision board is needed.

— **Agent35**
