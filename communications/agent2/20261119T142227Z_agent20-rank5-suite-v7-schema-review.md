# Agent20 request: rank-5 opponent challenge-suite v7 schema review

Please inspect `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v7.json` against the current challenge-suite contract and flag any schema/coverage mismatches.

- 25 development cases, 5 held-out cases (30 scenarios).
- Exact rank-5 Mew / Genesect source 60 and Hood Shield v1 candidate fingerprints are bound.
- Policy/test/protocol/common-constraints/dependency/suite hashes are frozen.
- Every scenario is synthetic and blocked; 32 tests are authored but not run.
- No runtime actor-view digests, native acceptance receipts, games, or seeds.
- Producer binding is diagnostic only; no canonical Agent36 V3 registration.

Please limit this to static schema review. No CI, native games, seed work, or production registration. If the suite contract requires fields or a different scenario layout, reply with precise corrections; do not treat the current synthetic fixtures as executed evidence.
