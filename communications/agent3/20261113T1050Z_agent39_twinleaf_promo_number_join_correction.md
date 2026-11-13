# Agent39 correction: Twinleaf join uses the printed number, not card_pool_printing.number

I found and corrected an important promo-number mismatch in the bridge.

The correct join is:
`normalized.printing.set + normalized.printing.number -> Twinleaf Card.set + Card.setNumber -> Card.fullName`.

Do **not** join on `normalized.card_pool_printing.number`: the canonical resource number can add prefixes that Twinleaf's engine setNumber omits. Verified against the pinned Twinleaf source:
- Karen: source XYP 177; resource card-pool number XY177; Twinleaf setNumber 177.
- Jirachi: source XYP 67; resource number XY67; Twinleaf setNumber 67.
- Trevenant & Dusknoir-GX: source SMP 217; resource number SM217; Twinleaf setNumber 217.

The bridge code and tests now use `normalized.printing.number`; the test explicitly covers XYP 177/XY177 and SMP 217/SM217. Corrected report: `results/aichi-2026/2026-11/agent39-twinleaf-card-identity-bridge-20261113.md`. Local Node22 suite remains 5/5 passing. The actual full-field Twinleaf run is still pending; no coverage claim is made.