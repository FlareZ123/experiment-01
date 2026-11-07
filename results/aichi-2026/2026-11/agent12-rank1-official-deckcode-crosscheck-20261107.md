# Rank 1 official deck-code cross-check

**Agent 12 | 7 November 2026 | primary-source provenance**

## Conclusion

The official Pokémon Card Game winner interview links the Open League champion Yasunori Kato's exact 60-card Japanese deck. The official deck code is **`QnLLQ9-qvPVqa-g9gi6Q`**. The official deck page reports 60 cards and lists the exact Japanese card names/counts. Translating those names to the English IDs in `results/aichi-2026/full-decklists.json` rank 1 produces an exact name/count match across all 60 cards.

This is a direct official cross-check of the champion reference list and its Japanese paper print provenance. It does not validate other Top32 lists.

## Primary sources

- Official winner interview: https://www.pokemon-card.com/info/005499.html
  - Lines 280-294 identify the Open League winner as Kato Yasunori and state that he used a Shadow Rider Calyrex VMAX deck.
  - Line 284 links to the exact decklist.
- Official deck page: https://www.pokemon-card.com/deck/confirm.html/deckID/QnLLQ9-qvPVqa-g9gi6Q
  - The page reports a 60-card deck and the code above.
- Official deck image: https://www.pokemon-card.com/deck/thumbs.html/deckID/QnLLQ9-qvPVqa-g9gi6Q/

## Official Japanese list

| Category | Card | Count | Japanese printing shown |
|---|---|---:|---|
| Pokémon | Shadow Rider Calyrex VMAX | 4 | S6K 037/070 |
| Pokémon | Shadow Rider Calyrex V | 3 | S6K 075/070 |
| Pokémon | Trevenant & Dusknoir-GX | 1 | SM12a 178/173 |
| Pokémon | Lillie's Clefairy ex | 2 | SV9 115/100 |
| Pokémon | Tapu Lele-GX | 2 | SM2L 052/050 |
| Pokémon | Latias ex | 1 | SV7a 078/064 |
| Pokémon | Dialga-GX | 1 | SM5S 069/066 |
| Pokémon | Mimikyu | 1 | SM4p 043/114 |
| Pokémon | Girafarig | 1 | SM8 045/095 |
| Pokémon | Marshadow | 1 | SM12a 064/173 |
| Pokémon | Radiant Eternatus | 1 | S12a 115/172 |
| Item | Mysterious Treasure | 4 | — |
| Item | Fog Crystal | 4 | — |
| Item | Quick Ball | 1 | — |
| Item | Hisuian Heavy Ball | 1 | — |
| Item | VS Seeker | 3 | — |
| Item | Battle Compressor (Team Flare Gear) | 1 | — |
| Item | Field Blower | 1 | — |
| Item | Night Stretcher | 1 | — |
| Item | Unfair Stamp (ACE SPEC) | 1 | — |
| Pokémon Tool | Float Stone | 1 | — |
| Pokémon Tool | Forest Seal Stone | 1 | — |
| Supporter | Lillie's Determination | 2 | — |
| Supporter | Carmine | 1 | — |
| Supporter | Iono | 1 | — |
| Supporter | Teammates | 1 | — |
| Supporter | Raihan | 1 | — |
| Supporter | Acerola | 1 | — |
| Supporter | Guzma | 1 | — |
| Supporter | Tulip | 1 | — |
| Stadium | Sky Field | 2 | — |
| Stadium | Dimension Valley | 1 | — |
| Energy | Basic Psychic Energy | 11 | — |

The official page exposes set/collector numbers for Pokémon entries; it does not expose set/collector numbers for the Trainer and Energy rows in its text view. Do not infer those missing physical printings from the English proxy IDs.

## Cross-check against repository data

Repository source: `results/aichi-2026/full-decklists.json`, rank 1, Yasunori Kato, archetype Shadow Rider Calyrex.

- Official page: 60 cards.
- Repository rank 1: 60 cards.
- Category counts match: 18 Pokémon, 17 Items, 2 Pokémon Tools, 9 Supporters, 3 Stadiums, 11 Energy.
- All translated card names and quantities match the repository's rank-1 inventory.

The repository inventory uses English proxy printing IDs; the official deck code is the authoritative Japanese-language source for the actual champion list.

## Scope and limitations

- This validates rank 1 only.
- It does not supply the missing exact 60-card lists for ranks 23, 25, or 28.
- It does not change the requirement to validate exact Japanese physical prints for a proposed new candidate deck.
- It is source confirmation, not competitive performance evidence.
