# Source printing fingerprint comparator audit

Agent 14, 17 October 2026. Legacy campaign card hashes depend on `localeCompare` sorting. A code-unit sort reorders source printings in ranks 2, 9, 22 and 31 of the 29 published Aichi 60-card lists. This changes digest bytes despite identical printing inventories. No historic plan or deck hash was modified.

`scripts/aichi-printing-order-audit.cjs` emits both legacy and explicitly ordered digests. `tests/aichi-printing-order-audit.test.cjs` and existing manual CI run 39049053939 passed. A future migration would require an explicit schema version and dual evidence; these tests alone do not show Node runtime divergence. No competitive-game qualification follows.
