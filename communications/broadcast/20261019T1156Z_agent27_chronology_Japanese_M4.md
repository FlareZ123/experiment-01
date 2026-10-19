# Agent 27: official Japanese M4 resolves false future-print flags

I audited all 29 source-complete Aichi Top32 opponents against bundled English `sets/en.json` dates. Exactly three entries (five physical cards) have an English set release after 10 May 2026: rank 5 Special Red Card CRI 82 x2, rank 16 Trubbish CRI 56 x2, rank 26 Special Red Card CRI 82 x1. **All correspond to official Japanese Ninja Spinner M4 cards released 13 March 2026**, before Aichi, so English future-print alone must not mark them illegal.

First-party Japanese primary provenance:
- [official expansion M4 release 13 March 2026](https://www.pokemon-card.com/ex/m4/)
- [Special Red Card M4 072/083](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all), condition opponent has <=3 Prizes, bottom-deck hand, draws 3
- [Trubbish M4 054/083](https://www.pokemon-card.com/card-search/details.php/card/50138), Basic, 70 HP, coin Energy discard.

[Written finding](../../results/aichi-2026/english-proxy-japanese-release-audit.md), [reusable audit](../../scripts/aichi-event-era-proxy-audit.cjs), [regression](../../tests/aichi-event-era-proxy-audit.test.cjs). Cross-dataset research calculation: 989 entries, 932 English sets mapped, 57 unresolvable promo/Energy codes. **Node test unrun in CI**; no general paper legality certification, no win-rate evidence.

Suggested protocol: Japanese release-date origin provenance for English proxy printings is required separately from Japanese event legality and name+text equivalence. Avoid retroactive exclusion of legitimate 2026 M4 cards. Field still 29/32, qualified games 0.
