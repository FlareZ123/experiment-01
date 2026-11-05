# Agent23: three original Aichi English CRI display printings are dated after the event, with earlier Japanese M4 equivalents

**5 November 2026 | complete 29-deck English-print chronology audit, official Japanese-card lookup, five local pure tests.** The archive is left unchanged. This finding does not imply that the Japanese original cards were illegal at Aichi.

## Audited population

I inspected all **29 authenticated 60-card name/count source decks** in [Top32 source archive](../aichi-2026/full-decklists.json), totaling **1,740 counted physical card copies**, and joined each card's printed English set code against the unique English PTCGO code and release date in [English set metadata](../../resources/sets/en.json). The benchmark's last-day cutoff was **2026-05-10**.

The read-only implementation is [scripts/agent23-original-print-chronology.cjs](../../scripts/agent23-original-print-chronology.cjs), with [five synthetic regression tests](../../tests/agent23-original-print-chronology.test.cjs). Local Node 22.16.0 **node:test 5/5 PASS**. Non-60 inputs are rejected. Unmapped or ambiguous English set codes remain unresolved and do not become either dated or illegal by inference.

**1,589/1,740** source copies had exactly one English metadata set date. Of these, **five** copies in **three** source rows used a later English release date:

| Original source | Archived English printing | Copies | English release | Japanese original, earlier |
| --- | --- | ---: | --- | --- |
| Rank **5**, Mew Genesect | **Special Red Card CRI 82** | **2** | 2026-05-22 | **M4 Ninja Spinner 072/083**, 2026-03-13 |
| Rank **16**, Absol Garbodor | **Trubbish CRI 56** | **2** | 2026-05-22 | **M4 Ninja Spinner 054/083**, 2026-03-13 |
| Rank **26**, Meloetta Donk | **Special Red Card CRI 82** | **1** | 2026-05-22 | **M4 Ninja Spinner 072/083**, 2026-03-13 |

English **Chaos Rising** (set ID me4 / code CRI) released May 22. The Japanese set **Ninja Spinner (M4)** was released **March 13, 2026**, according to the [official Pokémon Center Japan product page](https://www.pokemoncenter-online.com/9900000007898.html) and [official Japanese set page](https://www.pokemon-card.com/ex/m4/). The Japanese card database verifies [Trubbish M4 054/083 with Acid Spray](https://www.pokemon-card.com/card-search/details.php/card/50138) and [Special Red Card M4 072/083](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all). The international crosswalk is independently catalogued by [Limitless Trubbish CRI56](https://limitlesstcg.com/cards/CRI/56) and [Limitless Special Red Card CRI82](https://limitlesstcg.com/cards/CRI/82).

Consequently, these English card-display labels are historically anachronistic while their exact card-text equivalents were already released in Japan before the event. The source rows do **not** warrant removal on English date alone. They retain their original names and counts, and the [three-row machine-readable crosswalk](../aichi-2026/agent23-english-CRI-japanese-M4-provenance-20261105.json) records identities, copies, links and dates.

## The unresolved 151 copies

The English set metadata provides no unique PTCGO code mapping for five displayed source codes:

| Unmapped source code | Copies |
| --- | ---: |
| MEE | 120 |
| XYP | 12 |
| SMP | 7 |
| BWP | 7 |
| SP | 5 |

These include promo and Basic Energy displays. Their historical release date **cannot** be inferred from this join. Agent17 has independently investigated Basic Energy annotations; this audit does not independently revalidate that work. Do not add all 151 to the post-event count or silently classify their legality.

## Why exact Japanese card identity matters

Rank16's Trubbish must retain the corresponding original Japanese M4 054 **Darkness-type 70 HP Acid Spray** card text. Several preexisting English Trubbish printings have different attacks. Substituting an arbitrary earlier English Trubbish to force a valid date would alter the source opponent's game mechanics, even if the deck still counted 60 card names.

This audit does not certify whole-deck legal status, any paper bans, every original source list's provenance, or native simulator coverage. Three Top32 lists (ranks 23/25/28) remain missing. **Competitively qualified full games: zero. Demonstrated 99.5% win rate: none.**

## Next integration

Future source admission should track English display-print chronology, original Japanese availability and exact card identity separately. Preserve the source 60 and exact Japanese card effects under a traceable crosswalk. Treat the five unmapped promo/Energy codes as unresolved until properly sourced, and do not infer legality from English release dates alone.
