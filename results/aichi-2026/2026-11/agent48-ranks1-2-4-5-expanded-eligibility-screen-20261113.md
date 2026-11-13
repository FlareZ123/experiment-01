# Aichi ranks 1, 2, 4 and 5 — Expanded identity screen

**Decision:** all four remaining authenticated 60-card lists pass the English Expanded card-identity screen, subject to the explicit printing and authority limits below. Together with the prior ranks 8–22, 26, 27, 30–32 screens, this completes **24/24** potentially compatible lists at the identity-screen level. It does **not** certify the original physical Japanese copies.

## Scope and counts

- Event: Aichi Open League 2026, **10 May 2026**.
- Source: `results/aichi-2026/full-decklists.json`, Limitless export retrieved 15 October 2026.
- Card pool: bundled English snapshot, 176 sets / 20,635 card records; the resource index explicitly says it is not a complete Japanese card pool.
- Audited ranks: 1 Shadow Rider Calyrex, 2 Vileplume Control, 4 Raichu/Electrode Combo, 5 Mew/Genesect.
- Each list contains 60 cards: 4/4 pass, 240 total card copies, 132 source rows, 104 unique `(name, set, number)` rows. Deck-construction checks also pass: no non-Basic-Energy card exceeds four copies, no deck has more than one ACE SPEC, Prism Star, or Radiant Pokémon, and all four totals are exactly 60.
- 96 unique rows match an English Expanded-legal record exactly; six require display-name / promo-number normalization; two Basic Energy rows use an unresolved `MEE` placeholder.

## Normalizations, not substitutions

| Source display | English card-data identity |
| --- | --- |
| Ditto ♢ — LOT 154 | Ditto ◇ — LOT 154 |
| Battle Compressor — PHF 92 | Battle Compressor Team Flare Gear — PHF 92 |
| Trevenant & Dusknoir-GX — SMP 217 | Trevenant & Dusknoir-GX — SM 217 |
| Unit Energy LPM — UPR 138 | Unit Energy LightningPsychicMetal — UPR 138 |
| Karen — XYP 177 | Karen — XY 177 |
| Jirachi — XYP 67 | Jirachi — XY 67 |

The two `MEE` rows are rank 1 Psychic Energy (11 copies, source display `MEE 13`) and rank 2 Grass Energy (8 copies, `MEE 9`). These are Basic Energy identities, so they are not card-identity blockers; the export does not identify the actual physical print.

## Event-date chronology exception resolved

Rank 5 includes Special Red Card `CRI 82`. Its English representative is in Chaos Rising, released **22 May 2026**, twelve days after the Aichi event. The same card was already printed in Japanese Ninja Spinner as **M4 072/083**, released **13 March 2026**, 58 days before the event. The official Japanese card database identifies M4 072/083, and the official product catalogue dates Ninja Spinner to 13 March. This resolves card-identity availability by the event date; it does not prove which copy the player used.

## Banlist cross-check

The four ranks have zero exact hits against Agent3's independently sourced current official Expanded banned-printing overlay. That overlay reports zero exact hits across all 29 authenticated lists (27 banned identities / 49 printings) and documents eight stale `expanded: Legal` flags in the bundled snapshot. Accordingly, the bundled flag is only a card-pool cross-check; it is not the final banlist authority.

## Per-rank result

| Rank | Source archetype | Cards | ACE SPEC | Prism Star | Radiant Pokémon | Construction |
| ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | Shadow Rider Calyrex | 60 | 1 | 0 | 1 | Pass |
| 2 | Vileplume Control | 60 | 0 | 0 | 0 | Pass |
| 4 | Raichu / Electrode Combo | 60 | 1 | 1 | 0 | Pass |
| 5 | Mew / Genesect | 60 | 1 | 0 | 0 | Pass |

All four lists also satisfy the four-copy rule (excluding Basic Energy) and 60-card total. Rank 1's 11 Psychic Energy are Basic Energy; rank 1 has one Unfair Stamp ACE SPEC and one Radiant Eternatus, rank 4 has one Secret Box ACE SPEC and one Ditto ◇ Prism Star, and rank 5 has one Secret Box ACE SPEC. No ACE SPEC, Prism Star, or Radiant limit is exceeded.

## Limits and next work

- The Limitless export is an English display/identity normalization. Its `printing.language` field is not proof of the actual physical Japanese print used at the event.
- This screen does not convert any Aichi list into a paper Expanded list and does not change the original 60-card lists.
- The five incompatible lists (ranks 3, 6, 7, 24, 29) remain excluded from an unchanged international Expanded denominator; missing ranks 23, 25 and 28 remain unavailable.
- All 24 potentially compatible ranks now have identity-level screens. Remaining field work is to recover the three missing source lists and authenticate original physical Japanese printings for the 24 available lists.

## Reproduction

```bash
python -m unittest discover -s tests -p 'test_aichi_expanded_identity_audit.py'
python scripts/aichi_expanded_identity_audit.py --ranks 1,2,4,5 --output aichi-expanded-identity-audit.json
```

The existing `aichi-card-audit.yml` workflow now runs this focused job on relevant source/card-pool changes and uploads the machine-readable JSON. The result remains an identity-level screen, not a physical-print certificate or matchup result.

## External date and card references

- [Aichi Open League 2026 event listing](https://limitlesstcg.com/tournaments/566) — 10 May 2026.
- [Official Japanese card database: Special Red Card, M4 072/083](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all).
- [Official Pokémon Card product catalogue: Ninja Spinner](https://www.pokemon-card.com/products/index.html?dateLowerD=1&dateLowerM=1&dateLowerY=2025&dateUpperD=20&dateUpperM=4&dateUpperY=2026&productType=expansion) — 13 March 2026.