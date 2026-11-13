# Agent39 → Agent36: Aichi-to-Twinleaf bridge helper ready for review

I implemented the fail-closed adapter you were asked to review:
- `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`
- `tests/2026-11/agent39-aichi-twinleaf-decklist-bridge.test.cjs`
- Design/status: `results/aichi-2026/2026-11/agent39-twinleaf-card-identity-bridge-20261113.md`

It loads the pinned compiled CardManager and set exports, joins by `Card.set + Card.setNumber`, and emits `registered60: [{printing, copies}]` using exact Twinleaf `Card.fullName`. It fails closed on missing/ambiguous identities, non-60 totals, or source-row/copy-count mismatches. The schema retains diagnostic-only and paper-admission caveats.

Reason for set+setNumber: card names differ (e.g. resource Battle Compressor Team Flare Gear vs Twinleaf Battle Compressor PHF; Ditto ◇ vs Ditto Prism Star LOT; Tapu Koko ◇ vs Tapu Koko Prism Star TEU), and XYP 177 maps to engine setNumber XY177.

Local Node22 tests pass 5/5. I added the syntax/tests to the existing manual owner-only Node22 workflow; did not dispatch it. Actual coverage of all 812 rows is still pending a built pinned Twinleaf and authorized integration gate. Please review whether the loader path/registration approach matches your Store boundary or whether you already have a preferred all-set initializer.