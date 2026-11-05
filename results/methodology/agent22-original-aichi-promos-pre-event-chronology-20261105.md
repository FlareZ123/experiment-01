# Agent22: eight historically available promo designs cover 31 additional Aichi original-source copies

**2026-11-05 | read-only original-archive chronology | no gameplay and no legality certification**

## Question and source boundary

Agent23's source-wide English release-date census classified 1,589 of 1,740 copies by a unique English set release date, leaving 151 in code families `MEE` (120), `XYP` (12), `SMP` (7), `BWP` (7), and `SP` (5). Determine which of the **31 non-MEE promotional copies** have individually documented pre-event availability, preserving the original historical archive unchanged.

The event cutoff is **2026-05-10**. The underlying original source is [full-decklists.json](../aichi-2026/full-decklists.json), blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. [The eight-entry machine-readable manifest](../aichi-2026/agent22-original-promo-source-chronology-20261105.json) records the set aliases, card names, copy counts, conservative month-end availability bounds, date evidence and source links.

## Actual archived incidence

Read-only live-archive enumeration independently identified **29 original decks, 22 promo rows, 31 promo copies and eight print aliases**. Every row's exact `name + printed set + number` matches the date-evidence manifest; all eight documented availability upper bounds precede the event. There are zero unknown or wrongly named promo rows in these four code families.

| Source display alias | Original copies | Rows | Date bound and provenance |
| --- | ---: | ---: | --- |
| `BWP:50` Tropical Beach | 4 | 3 | By August 2012, [Worlds 2012 contemporary account](https://www.pokebeach.com/2012/08/worlds-2012-swag-tropical-beach-promo) |
| `BWP:153` Palace Belt | 3 | 2 | By June 2012, [official Japanese card](https://www.pokemon-card.com/card-search/details.php/card/28213), [Spring 2012 distribution history](https://bulbapedia.bulbagarden.net/wiki/Palace_Belt_(BW-P_Promo_153)) |
| `SMP:217` Trevenant & Dusknoir-GX | 1 | 1 | By October 2019, [Pale Moon-GX Box history](https://bulbapedia.bulbagarden.net/wiki/Trevenant_%26_Dusknoir-GX_(SM_Promo_217)) |
| `SMP:NAN25` Palace Book | 6 | 3 | By November 2017, [official Japanese card](https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all), [promo distribution](https://bulbapedia.bulbagarden.net/wiki/Palace_Book_(SM-P_Promo)) |
| `SP:127` Player's Ceremony | 5 | 4 | By September 2020, [official S-P 127 card](https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY), [2019-20 point prize history](https://pokeboon.com/127sp-playersceremony-promo/) |
| `XYP:49` Regirock | 3 | 2 | By May 2015, [contemporary Roaring Skies blisters](https://www.pokebeach.com/2015/05/xy-regirock-pangoro-heliolisk-meowstic-promos) |
| `XYP:67` Jirachi | 1 | 1 | By November 2015, [BREAKthrough blister account](https://bulbapedia.bulbagarden.net/wiki/Jirachi_(XY_Promo_67)) |
| `XYP:177` Karen | 8 | 6 | By September 2016, [2016 English/Japanese distribution history](https://bulbapedia.bulbagarden.net/wiki/Karen_(XY_Promo_177a)) |
| **Total** | **31** | **22** | **8 pre-event card designs** |

The bounds are intentionally conservative *latest-by* dates (usually the final calendar day in a sourced month), not invented exact release days. In particular, `BWP` refers to the **English BW50** promo for Tropical Beach and the **Japanese BW-P 153** promo for Palace Belt. Similarly `SMP` mixes English SM217 with the **Japanese unnumbered SM-P Palace Book** stored under catalog alias `NAN25`. A code-only join to one English release date incorrectly collapses distinct printing systems.

## Reproduction and falsification

[Read-only auditor](../../scripts/agent22-aichi-promo-chronology.cjs) traverses complete original 60s, requires each source promo's exact `set:number:name`, checks every availability upper bound relative to the event and returns unmatched aliases and count discrepancies. [Regression tests](../../tests/agent22-aichi-promo-chronology.test.cjs) cover live 29-deck archive counts, name mismatch, number mismatch, post-event dates and duplicate aliases. The original JSON was never modified.

The independent live GitHub source-to-manifest reconciliation executed on the current archive and returned **22 rows / 31 copies, 8 unique aliases, 29 decks, all matches, zero misses**. The new Node test file is committed but **has not passed a real Node or CI test run**. An attempted integration into the existing manual `aichi-card-audit.yml` was blocked by tool safety checks; the workflow was left unchanged. The numerical read-only archive reconciliation is a separate check and must not be represented as an executed Node regression suite.

## Consequence and unresolved requirements

This closes the **31 previously undated promotional display-copy chronology classifications** in Agent23's census at the level of evidenced pre-event card availability; the remaining 120 `MEE` entries have an independent Agent17/Agent22 post-event artwork-provenance audit. It does **not** establish that original players physically owned these exact printings, nor verify the Japanese Aichi paper Expanded legality of every promo or the full 29 decks. The original rank23/25/28 source lists are still unavailable.

**Zero competitively qualified games, no selected fixed 60, and no proven 99.5% performance.** No candidate advantage or simulation result follows from this source chronology. The findings belong in the source-admission evidence layer, with the original 60s unchanged, without promotion into the decision board's best-deck verdict.
