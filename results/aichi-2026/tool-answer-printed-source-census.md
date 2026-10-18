# Published Aichi Top32 Tool-answer printing census

**Agent 2, 18 October 2026.** Evidence class: reproducible **published-source list-count arithmetic only**, no observed Tool removal, no hand-access probability, no legal decision validation, no matchup strength estimate.

## Source and method

The repository [published full-list dataset](full-decklists.json) contains **29 exact 60-card print-resolved** Aichi 2026 Expanded Top32 lists; ranks **23, 25, 28** remain missing. I enumerated a deliberately narrow list of six Trainer names with potential to discard or remove an opposing Tool: **Field Blower, Faba, Lost Vacuum, Xerosic, Tool Scrapper, Startling Megaphone**. [Source-count script](../../scripts/aichi-tool-answer-printing-census.cjs) independently sums printed copies across printings and deduplicates deck identities. [Unit tests](../../tests/aichi-tool-answer-printing-census.test.cjs) pin observed totals.

| Card | Published decks with ≥1 copy | Printed total copies across 29 |
| --- | ---: | ---: |
| Field Blower | 9 | 11 |
| Faba | 7 | 8 |
| Lost Vacuum | 1 | 1 |
| Xerosic | 0 | 0 |
| Tool Scrapper | 0 | 0 |
| Startling Megaphone | 0 | 0 |

**14 of 29** published source 60s contain at least one card from this narrow six-name set, and **15 of 29 contain none**. The ranks with no listed candidate removal printing are **4, 9, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 26, 27, 32**. The champion rank1 Shadow Rider source contains **one Field Blower**. The rank11 Absol/Garbodor source contains **none from this set**.

Separately, **Tool Jammer** is printed in **five decks** (five total copies) and **Jamming Tower** in zero; neither is included in the direct-removal union. This count should not imply that a positional Tool-suppression effect answers an equipped **Benched** Garbodor, or that their text effects are equivalent.

## Strategic interpretation and limits

The presence of a Tool-answer card in a source list does not establish it being in hand after a genuine rank11-first turn; one searchable copy may be Prized, inaccessible, or expensive to reach while defending. Conversely, absence of these six names does **not** prove the deck is unable to break a Garbotoxin board: Pokémon Knock Outs, switching or gust, counter-lock, other card text and multi-turn lines may solve it. The count does not evaluate Supporter contention, Item lock, opponent interaction, firstness, turn constraints, sequencing or competence.

The [archived source-dealt positive Garbodor lock](rank11-autonomous-opponent-policy.md) found that rank1's first response used Psychic Energy and Pass; **that one observed first hand lacked Field Blower**. This is consistent with the printed singleton being inaccessible immediately in that selected fixture; it does not imply the singleton is worthless. The [prospective rank11 source-K0 work](rank11-conditional-K0-screen.md) is designed to expose more genuine early locks before deciding which potential answers are realistic.

**Field 29/32. Qualified competitive matches: zero. No 99.5% fixed-deck strength claim.**
