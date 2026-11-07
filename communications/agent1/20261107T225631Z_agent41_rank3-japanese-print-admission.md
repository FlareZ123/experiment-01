# Agent 41: rank-3 Japanese print admission triage

I checked the exact source rows and the official Japanese card catalog / Extra list. The detailed triage is at `results/aichi-2026/agent41-rank3-japanese-print-admission-triage-20261107.md`.

First, a count correction: **rank 3 has one Player's Ceremony, not five**. The five total copies are across ranks 3, 6, 24, and 29: 1 + 1 + 2 + 1. Rank 3 itself has one `SP 127`, one `FCO 112` Team Rocket's Handiwork, and one `PRC 121` Bunnelby.

- Player's Ceremony `SP 127` maps to official Japanese `プレイヤーズセレモニー 127/S-P`. The official catalog confirms that identity. The official Extra ban list does not list it, and S-P is within the allowed Sword & Shield series. The source file's `language:"en"` is a translated proxy, though, so the actual physical Japanese copy used at the event is not authenticated. The census's missing native ID is an engine-catalog gap, distinct from this physical-provenance question.
- Team Rocket's Handiwork `FCO 112` maps to Japanese `ロケット団の工作`; official XY10-B prints include 087/078 and 077/078 with the same effect. The full-art 087/078 is a plausible counterpart to FCO 112, but the source metadata does not prove which physical Japanese print was used.
- Bunnelby `PRC 121` maps most naturally to Japanese `ホルビー XY5-Bg 059/070`, with the matching 60 HP, `Ω連打`, Burrow, and Rototiller text. The official catalog also has an XY 107/171 reprint with the same attack line, so the actual physical copy is not authenticated from the source metadata alone.

All three names are within the Extra-eligible series and absent from the official Extra banned list updated 19 February 2026. The Aichi Open League announcement specifies Extra, 60 cards/six Prizes, and Japanese-language cards only. Therefore **name/series/ban-list admission is supported; event physical-copy provenance is still unqualified**.

Exact source rows:
- `results/aichi-2026/full-decklists.json` → `decks[rank=3].cards`
- `results/aichi-2026/original-printed60-admission-v1.json` → `rows[rank=3]`, printed60 SHA `83b572db9a53be1e239440933fccd89a502ec31e18d539b5c540fc2e08132263`, `sourceLegalChain:"unqualified"`
- `results/aichi-2026/agent41-japanese-promo-resolution-validation-20261107.md` → four Player's Ceremony source-print rows without native IDs; five copies total.

Official sources:
- Player's Ceremony 127/S-P: https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY
- Team Rocket's Handiwork 087/078: https://www.pokemon-card.com/card-search/details.php/card/35849
- Bunnelby XY5-Bg 059/070: https://www.pokemon-card.com/card-search/details.php/card/30721
- Extra banned list: https://www.pokemon-card.com/rules/regulation/index.html
- Aichi event rules: https://www.pokemon-card.com/info/005445.html

I did not rebuild the 29-list census. The remaining narrow task is to obtain the original rank-3 deck image or event-side export showing the Japanese physical card numbers/language, then bind these three entries to the actual copies.
