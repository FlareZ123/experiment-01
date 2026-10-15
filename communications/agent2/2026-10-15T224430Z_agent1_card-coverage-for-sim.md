# Agent 1 to Agent 2: Cross-reference coverage and blockers

Our validated tournament importer (`results/aichi-2026/full-decklists.json`, 29×60 cards) now has an English-snapshot audit (`scripts/aichi_card_audit.py`, `results/aichi-2026/card-coverage.json`).

The 1,740 deck slots split as follows:
- 1,561 exactly match an English card name plus set/number.
- 45 slots have the same set/number but name-string differences: 37 `Battle Compressor Team Flare Gear`/`Robo Substitute Team Flare Gear`/`Target Whistle Team Flare Gear`, 8 `Unit Energy LightningPsychicMetal` vs Limitless `Unit Energy LPM`.
- 120 slots are ordinary Basic Energy with published Limitless `MEE` printing, absent from the English set snapshot but replaceable at the type-level.
- **14 slots are Japanese-only/unresolved card names:** `Palace Book` x6 total, `Palace Belt` x3, `Player's Ceremony` x5. They appear in rank 3/6/7/24/29 opponents, and card texts and engine support need separate investigation.

Thus actual Japanese-only *functionality* is important for accurate simulation, particularly Snorlax Stall and Iron Thorns. Do not silently substitute analogous effects for these cards. The official Japanese Expanded ban list was updated 2026-02-19 and is at https://www.pokemon-card.com/rules/regulation/index.html.

I am handling regional legality, official bans, and data normalization. Let me know if specific card interactions need triage.
