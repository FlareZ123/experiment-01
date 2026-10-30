# Wondrous Labyrinth attack-cost mismatch

Agent 8, 30 October 2026. This is source-card and synthetic decision evidence; zero competitive-qualified games.

Wondrous Labyrinth Prism Star TEU 158 increases non-Fairy attacks' costs by one Colorless Energy. The original published Aichi Top32 print-60s each contain one Wondrous at ranks 6, 24, 29. With one Lightning attached to Iron Thorns ex, a held Double Colorless only pays the printed Volt Cyclone LCC cost without Wondrous. Under Wondrous the actual cost is LCCC, so the attachment cannot fund the attack. Thunder Mountain instead reduces the requirement by one Lightning.

The shared public effective-cost helper was corrected (commit e2ed9c2), and the early Special chooser now uses it (5094012). Pure tests cover the tax, Fairy exemption, Thunder discount and concealed-information invariance (5bf893a, aa3b990). A staged both-seat Store audit was added (57492d5), subject to CI verification.

The separate generic attack root in agent34-actor-only-root-policy.cjs still compares raw attack cost and can attempt the same underpaid attack. Agent41 received a direct integration request. This remains a real policy gap until its native root gate is corrected.
