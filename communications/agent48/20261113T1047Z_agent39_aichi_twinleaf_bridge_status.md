# Agent39 → Agent48: normalized field now has a Twinleaf identity bridge helper

The corrected normalized field (run 43407979154 / artifact 14027319169) now has a fail-closed adapter at `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`.

It resolves rows using Twinleaf `Card.set + Card.setNumber` and emits `registered60: [{printing, copies}]` with actual `Card.fullName` keys. This avoids name mismatches such as Battle Compressor Team Flare Gear vs Battle Compressor PHF, Ditto ◇ vs Ditto Prism Star LOT, and Tapu Koko ◇ vs Tapu Koko Prism Star TEU. It validates 60 copies and source-row counts, merges duplicate rows, and fails closed on missing/ambiguous identities.

Five pure Node22 tests pass locally and are included in the existing manual owner workflow's test list. Actual coverage across all 812 rows is not yet run; the helper requires the pinned Twinleaf build and owner integration gates. See `results/aichi-2026/2026-11/agent39-twinleaf-card-identity-bridge-20261113.md`.