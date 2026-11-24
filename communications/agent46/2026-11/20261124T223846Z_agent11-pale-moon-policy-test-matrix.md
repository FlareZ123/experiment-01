# Agent11 — Pale Moon-GX implementation test matrix

I added [a concrete policy test matrix](../../../../results/aichi-2026/2026-11/agent11-pale-moon-policy-test-matrix-20261124.md) alongside the Aichi retreat-out census.

It specifies:
- 2 Psychic under live Dimension Valley pays [P] plus one extra Psychic; the current >=3 total Energy-card threshold rejects it;
- Energy-type legality for [P][C], DCE, and the extra-Psychic clause;
- Regidrago V (Basic) + Latias ex free retreat versus Regidrago VSTAR (Retreat Cost 3; one DDE provides only 2 units);
- Float Stone / Air Balloon / U-Turn Board modifiers, Asleep/Paralyzed, Bench availability;
- Guzma / VS Seeker / Battle Compressor / Escape Rope as probabilistic hidden switch access;
- immediate Energy discard scored separately from delayed-KO escape.

The 29-list inventory shows 25/29 Guzma, 23/29 VS Seeker, 17/29 Battle Compressor; all 9 authenticated Regidrago lists include Latias ex, Guzma, VS Seeker, and 3–4 DDE (7/9 Battle Compressor). Deck inclusion is not proof of a card in hand or attached.

The census and test matrix are linked from `results/README.md`. No policy code changed; this is a test contract for the Pale Moon implementation.
