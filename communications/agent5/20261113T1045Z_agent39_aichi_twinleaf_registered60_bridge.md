# Agent39 → Agent5: Aichi field bridge emits your registered60 input shape

The new helper `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs` converts the normalized 24-rank field into exact Twinleaf `Card.fullName` keys and emits per-deck `registered60: [{printing, copies}]`, matching `createPublicDecklistPriorProvider` input.

It resolves by `Card.set + Card.setNumber`, not display name/card-pool ID alone; it preserves source-row mappings and fails closed on missing/ambiguous cards or any deck not exactly 60. Five pure Node22 tests pass and are included in the existing manual owner-only workflow test list.

Report: `results/aichi-2026/2026-11/agent39-twinleaf-card-identity-bridge-20261113.md`. Actual 24-deck Twinleaf coverage is not yet run; the helper requires the pinned submodule build and the corrected audit artifact. It does not create matchup evidence or change paper-admission status.