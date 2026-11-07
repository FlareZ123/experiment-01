# Rank 1 official deck-code cross-check

**Question.** Does the rank-1 list in the repository's Aichi Open 2026 field dataset match the official deck recipe linked from the Open League winner interview?

## Primary source

The official Pokémon Card Game deck page is:

- https://www.pokemon-card.com/deck/confirm.html/deckID/QnLLQ9-qvPVqa-g9gi6Q

The official CL Aichi 2026 Open League winner-interview page links to this recipe from its Open League champion section. The event rules page is https://www.pokemon-card.com/info/005445.html and specifies Japanese-language cards for the event.

## Comparison

The official deck page displays 60 cards across 33 unique card names:
- 18 Pokémon across 11 names;
- 31 Trainer cards across 21 names;
- 11 Basic Psychic Energy.

I manually normalized the 33 Japanese card names to their English names and compared the complete name/count multiset with rank 1 in `results/aichi-2026/full-decklists.json` (source blob SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`). The comparison was exact:
- official deck page total: 60;
- repository rank-1 total: 60;
- unique names on each side: 33;
- card-name/count mismatches: **0**.

The official recipe and repository rank-1 entry therefore agree on the complete 60-card composition. The player is Yasunori Kato, matching rank 1 in `field.csv`.

## Scope and limitations

This verifies the rank-1 card-name/count composition against an official event-linked deck recipe. It does not establish the exact English proxy printings in `full-decklists.json`. The official Japanese deck page is the authoritative source for the event-language printings; preserve its Japanese set and collector-number data when checking paper legality. Do not infer that the repository's English printing fields are the physical copies used at Aichi.

This is source/provenance validation only. No game, simulator match, or competitive-strength result was produced. The 29/32 exact-opponent denominator is unchanged.

## Regression test

The official Japanese name/count capture is preserved in `official-rank1-deck-code.json`. `tests/aichi-rank1-official-deckcode.test.cjs` checks all 33 names and counts against rank 1 in `full-decklists.json`, including the 60-card total and category totals. It passes 1/1 in the isolated V8 harness against the full fetched dataset. A targeted local Node.js v22.16.0 run also passes 1/1 using the exact official JSON and test blobs with a rank-1-only fixture extracted from the exact full-dataset blob; the repository test will use the complete dataset in CI.
## Japanese print identifiers visible on the official page

The official page exposes set and collector numbers for all 11 Pokémon. These are retained in `official-rank1-deck-code.json`:

| Card | Japanese set | Collector number |
| --- | --- | --- |
| Shadow Rider Calyrex VMAX | S6K | 037/070 |
| Shadow Rider Calyrex V | S6K | 075/070 |
| Trevenant & Dusknoir-GX | SM12a | 178/173 |
| Lillie's Clefairy ex | SV9 | 115/100 |
| Tapu Lele-GX | SM2L | 052/050 |
| Latias ex | SV7a | 078/064 |
| Dialga-GX | SM5S | 069/066 |
| Mimikyu | SM4p | 043/114 |
| Girafarig | SM8 | 045/095 |
| Marshadow | SM12a | 064/173 |
| Radiant Eternatus | S12a | 115/172 |

The official page's Trainer breakdown is 17 Items, 2 Pokémon Tools, 9 Supporters, and 3 Stadiums (31 Trainer cards total). The text view does not expose set/collector identifiers for the Trainer cards or Energy, so none are inferred.