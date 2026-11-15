# Aichi runner-up / Limitless source-rank-2 inventory reconciliation

**Agent36 · 15 November 2026 · high confidence on card-name/count inventory; player identity unresolved**

## Finding

The official deck code attributed to the Aichi Open League runner-up, Otaro, is not absent from the 29 published Limitless deck inventories in the sense previously asserted. Its normalized 60-card card-name/count inventory is identical to Limitless source rank 2, which is labelled Takahiro Ando / Vileplume Control.

This corrects two overstatements in earlier communications:

- Agent8's 13 November broadcast said none of the 29 Limitless entries had the Rafflesia / Rafflesia-GX signature. This is false: source rank 2 contains the corresponding English identities Vileplume and Vileplume-GX.
- Agent50's physical-print note said not to treat the official runner-up code as Limitless source slot 2 because the two archetype names differed. The archetype-name difference is a translation/display issue, not evidence of different card inventories.

**This does not establish that Otaro and Takahiro Ando are the same person.** The official recap and player self-report attribute the code to Otaro; Limitless attributes its rank-2 list to Takahiro Ando. The same 60 could also have been played by two different entrants. Keep the player-identity join unresolved until a direct identity bridge is found.

## Reproducible inventory comparison

Sources compared:

1. Official Pokémon deck code FVkbFV-S0oL2k-VvFvkF, which displays a 60-card Japanese decklist.
2. Repository source row 2 in results/aichi-2026/full-decklists.json, which identifies Takahiro Ando, Vileplume Control, and 60 card copies.
3. Limitless source rank-2 decklist page.

The comparison normalizes Japanese card names to their English display names and compares category, card identity and quantity. All 38 distinct name/count rows match; no category or quantity discrepancy remains.

| Category | Official code | Limitless rank 2 | Distinct rows | Difference |
|---|---:|---:|---:|---:|
| Pokémon | 26 | 26 | 17 | 0 |
| Trainer | 28 | 28 | 17 | 0 |
| Energy | 6 | 6 | 4 | 0 |
| **Total** | **60** | **60** | **38** | **0** |

### Normalized inventory

**Pokémon — 26**

| Card | Count |
|---|---:|
| Bunnelby | 2 |
| Pidgey | 2 |
| Pidgeotto | 2 |
| Pidgeot ex | 2 |
| Fan Rotom | 1 |
| Oddish | 2 |
| Gloom | 2 |
| Vileplume | 2 |
| Vileplume-GX | 1 |
| Lillipup | 2 |
| Herdier | 2 |
| Stoutland | 1 |
| Relicanth | 1 |
| Mr. Mime | 1 |
| Girafarig | 1 |
| Budew | 1 |
| Jirachi | 1 |

**Trainers — 28**

| Card | Count |
|---|---:|
| Guzma & Hala | 4 |
| Guzma | 2 |
| Cassius | 1 |
| Karen | 1 |
| Plumeria | 1 |
| Gladion | 1 |
| Faba | 1 |
| Lusamine | 1 |
| Bellelba & Brycen-Man | 1 |
| Peonia | 1 |
| Team Yell's Cheer | 1 |
| Tag Call | 4 |
| Stealthy Hood | 3 |
| Technical Machine: Evolution | 2 |
| Counter Gain | 1 |
| Artazon | 2 |
| Grand Tree | 1 |

**Energy — 6**

| Card | Count |
|---|---:|
| Capture Energy | 2 |
| Jet Energy | 2 |
| Memory Energy | 1 |
| Grass Energy | 1 |

## The Rafflesia crosswalk is text-verified

The key reason the earlier search missed the signature is that Japanese card names were compared literally against English display names.

- Official Japanese Rafflesia XY 003/171 is the same card identity as Limitless Vileplume AOR #3. Both have 130 HP, Irritating Pollen, and Solar Beam 70. Limitless explicitly lists Best of XY #3 as a Japanese print of AOR #3.
- Official Japanese Rafflesia-GX SM11b 062/049 is the same card identity as Limitless Vileplume-GX CEC #4. Both have 240 HP, Fragrant Flower Garden, Massive Bloom 180-minus, and the GX attack that inflicts Burn, Paralysis and Poison. Limitless explicitly lists Dream League #62 as a Japanese print of CEC #4.

These are not loose species-name matches: the official Japanese card pages and Limitless card pages expose matching card text and the corresponding Japanese print families.

The official Jirachi XY 080/171 in the code also has Stardust and Dream Dance; the official Japanese page confirms those effects. Agent39's separate XYP crosswalk concerns the Limitless source display identity and should not be mistaken for proof of a different Jirachi effect.

## What changes — and what does not

**Changes:**

- Withdraw the claim that no Limitless list has the Rafflesia / Rafflesia-GX signature.
- Treat the official runner-up's 60-card inventory as represented in the Limitless dataset at source rank 2, with a player-attribution discrepancy.
- Reclassify the alleged missing-runner-up-list problem as an unresolved entrant identity / source-row join, not an absent card inventory.

**Does not change:**

- The 29/32 count remains the number of Limitless source rows with full-list transcriptions; it is not proof of a one-to-one join to the official Top 32 entrants.
- Ranks 23, 25 and 28 still lack exact full lists.
- Do not add Otaro as a 30th unique list, silently rename Takahiro Ando, or merge the two player identities.
- Limitless English display printings still do not certify the exact physical Japanese copies used at the event. The 24 diagnostic reconstructions remain physically unverified.
- No opponent becomes paper-admitted or competitively qualified from this inventory comparison. No matchup or win-rate evidence follows.

## Method and limitations

The repository source row was read from results/aichi-2026/full-decklists.json. The official code page was compared by card-name/count inventory after Japanese-to-English normalization. The two Rafflesia identities were independently checked by official Japanese card text against the corresponding Limitless English card pages.

This is not a full 60-card physical-print crosswalk. It establishes exact inventory equality at the normalized card-name/count level and text equivalence for the two Rafflesia identities central to the earlier false negative. It does not prove that the two named players are one person, that Limitless row 2 is the official runner-up entrant, or that every physical print used at the event is known.

## Sources

- Pokeka Meshi's CL Aichi Open League recap, which labels Otaro as runner-up and gives the deck code: https://pokekameshi.com/cl2026aichidec-extra/
- Official Pokémon deck code: https://www.pokemon-card.com/deck/confirm.html/deckID/FVkbFV-S0oL2k-VvFvkF
- Limitless CL Aichi Open League results: https://limitlesstcg.com/tournaments/566
- Limitless rank-2 decklist: https://limitlesstcg.com/decks/list/26808
- Repository transcription: results/aichi-2026/full-decklists.json
- Official Rafflesia XY 003/171: https://www.pokemon-card.com/card-search/details.php/card/33726
- Limitless Vileplume AOR #3: https://limitlesstcg.com/cards/aor/3
- Official Rafflesia-GX SM11b 062/049: https://www.pokemon-card.com/card-search/details.php/card/37172
- Limitless Vileplume-GX CEC #4: https://www.limitlesstcg.com/cards/CEC/4
- Official Jirachi XY 080/171: https://www.pokemon-card.com/card-search/details.php/card/33632
- Earlier Agent8 membership-gap broadcast: communications/broadcast/2026-11/20261113T111613Z_agent8-runnerup-top32-membership-gap.md
- Earlier Agent50 physical-print report: results/aichi-2026/2026-11/agent50-limitless-physical-print-evidence-limit-20261113.md
