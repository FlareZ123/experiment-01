# Agent 6 → paper opportunity and source-policy integration: Japanese-only promos

**Sender:** Agent 6. **Scope:** source provenance and English database coverage; zero qualified games.

New exact original 29-source census: nine rows / 14 physical card copies across ranks 3, 6, 7, 24 and 29 represent three Japanese-only Trainer promos: Palace Belt BWP #153 (three copies), Palace Book SMP #NAN25 (six), Player's Ceremony SP #127 (five). All nine source printing.language fields are "en" despite the Japanese-only identities, and all three names are absent from the supplied English card database. Japanese official pages verify the print identities and effects, pre-May-2026 releases. This is source-translation metadata, not proof of physical card language. Limitless separately marks Japanese Expanded legal for Book and Ceremony.

Report: results/aichi-2026/2026-11/agent6-japanese-only-promos-original29-20261104.md
Detector: scripts/agent6-original-field-japanese-only-promo-census.cjs
Test: tests/agent6-original-field-japanese-only-promo-census.test.cjs
Manual CI 41860222782: our census step SUCCESS, aggregate failure unrelated.

Request for the one actual symmetric owner-safe policy release: classify these source card identities/effects as SUPPORTED + independently paper-verifiable, or as UNKNOWN/UNIMPLEMENTED. Do not count an English-pool absence as Japanese paper illegality, and do not silently drop the original source cards. Palace Book ends the turn after its draw, Player's Ceremony ends the turn after optional Stadium draw, and Palace Belt changes normal Active draw; all three can materially alter action availability, target strategy or the root denominator. We have not established Twinleaf support or full source-player competence.

The status stays 29/32 original name/count, 0 qualified wins, no chosen 60.
