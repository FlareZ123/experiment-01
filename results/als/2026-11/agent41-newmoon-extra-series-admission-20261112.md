# New Moon Lockbreaker v1: event-date Japanese Extra series-admission crosscheck

**Agent 41 — 12 November 2026. Evidence class: official Japanese series/product/card-identity crosscheck.** This is a candidate-specific admission check, not a full paper-legality certificate or gameplay result.

## Decision

**Series admission passes for the complete proposed 60-card candidate.** Its 34 distinct printed-card rows use 27 distinct Japanese set codes, all belonging to the Japanese Extra-eligible MEGA, Scarlet & Violet, Sword & Shield, Sun & Moon, or XY/XY BREAK series. It uses no pre-BW printing that would need the separate legacy-card whitelist.

The governing official Japanese Extra page was updated **19 February 2026**, before the candidate's event-date target of **10 May 2026**. It defines Extra as BW onward and explicitly permits the MEGA, Scarlet & Violet, Sword & Shield, Sun & Moon, XY/XY BREAK, and BW series. The official page also lists the event-date banned cards and the restricted Supporter name families. See [official Japanese regulation page](https://www.pokemon-card.com/rules/regulation/index.html), especially the Extra section.

## Candidate identity and exact source delta

Inputs:
- Proposed candidate: `results/als/new-moon-lockbreak-japanese-print-60.json`
- Official source deck-code extraction: `results/als/new-moon-official-japanese-print-60.json`
- Source code: `GxxDYx-a4rD4W-a8xYxc`; this is a 52nd-place New Moon Perfection source, **not** an Aichi Top 32 entry.

A direct JSON comparison gives:
- Official source: **33 rows / 60 cards**.
- Proposed candidate: **34 rows / 60 cards**.
- **31 rows** retain the exact source name, count, Japanese card ID, and set.
- Rescue Carrier retains its exact S12a printing (card ID 42403) but drops from **4 to 2**.
- Trainer's Mail (XY6-B, card ID 30925) drops from **2 to 0**.
- The only new rows are **2 Field Blower** (SM4p, card ID 34321) and **2 Canceling Cologne** (S9a, card ID 41294).

Thus all 60 candidate copies have an exact proposed Japanese-print identity: 31 unchanged source rows, one reduced-count source row, and the two already audited added printings. The existing [Japanese print and dated ban-screen audit](../new-moon-lockbreak-japanese-print-audit.md) contains the exact physical-print digest, mutation tests, and specific Duskull/Unown ban-print distinctions.

## All 27 set codes mapped to the permitted series

| Official Extra series | Candidate set codes | Distinct rows | Copies |
| --- | --- | ---: | ---: |
| MEGA | `ENE`, `M2a`, `M3`, `MA`, `MC` | 7 | 13 |
| Scarlet & Violet | `SV3`, `SV4a`, `SV6`, `SV6a`, `SVEM`, `SVF`, `SVHK` | 7 | 15 |
| Sword & Shield | `S4`, `S8b`, `S9a`, `S12`, `S12a`, `SI` | 6 | 10 |
| Sun & Moon | `SM4S`, `SM4p`, `SM6b`, `SM8b`, `SM9`, `SM10`, `SM12a` | 10 | 13 |
| XY / XY BREAK | `XY`, `XY7-B` | 4 | 9 |
| **Total** | **27 unique codes** | **34** | **60** |

This grouping was recomputed from the candidate manifest's `japanese_set`, `japanese_card_id`, and `count` fields. The official Extra page's permitted-series list covers every group above. No candidate row uses LEGEND, DPt, DP, ADV, or an older series that would need the separate historical exception list.

## MEGA-series admission, exact products, and release timing

The key gap in the older candidate audit was explicit admission of the newer MEGA-era product codes. The official [MEGA-series regulation page](https://www.pokemon-card.com/rules/regulation/mega.html) lists the relevant products under the MEGA series, which the official Extra page explicitly permits.

| Candidate set / product | Candidate print(s) independently mapped to the official product | Official release date | Days before 10 May 2026 |
| --- | --- | --- | ---: |
| `MA` — Premium Trainer Box MEGA | Squawkabilly ex, card ID 47869, `MA 010/043` | 1 Aug 2025 | 282 |
| `ENE` — Starter Set MEGA Mega Diancie ex | Basic Psychic Energy, card ID 48307 | 5 Sep 2025 | 247 |
| `M2a` — High Class Pack MEGA Dream ex | Latias ex, card ID 48597, `M2a 075/193` | 28 Nov 2025 | 163 |
| `MC` — Start Deck 100 Battle Collection | Lillie's Clefairy ex (49003), Powerglass (49399), Lillie's Determination (49445) | 19 Dec 2025 | 142 |
| `M3` — Expansion Pack Munikis Zero | Telepathic Psychic Energy, card ID 49712, `M3 079/080` | 23 Jan 2026 | 107 |

Official card pages:
- [Squawkabilly ex — MA 010/043](https://www.pokemon-card.com/card-search/details.php/card/47869)
- [Basic Psychic Energy — Starter Set MEGA Mega Diancie ex](https://www.pokemon-card.com/card-search/details.php/card/48307)
- [Latias ex — M2a 075/193](https://www.pokemon-card.com/card-search/details.php/card/48597)
- [Lillie's Clefairy ex — MC 287/742](https://www.pokemon-card.com/card-search/details.php/card/49003)
- [Powerglass — MC 683/742](https://www.pokemon-card.com/card-search/details.php/card/49399)
- [Lillie's Determination — MC 729/742](https://www.pokemon-card.com/card-search/details.php/card/49445)
- [Telepathic Psychic Energy — M3 079/080](https://www.pokemon-card.com/card-search/details.php/card/49712)

Official product pages establish the release dates and product identities: [Premium Trainer Box MEGA](https://www.pokemon-card.com/ex/m1/index.html), [Starter Set MEGA Mega Diancie ex](https://www.pokemon-card.com/products/mega/mb.html?rss=250905), [MEGA Dream ex](https://www.pokemon-card.com/ex/m2a/index.html), [Start Deck 100 Battle Collection](https://www.pokemon-card.com/ex/mc/), and [Munikis Zero](https://www.pokemon-card.com/ex/m3/index.html). The official MEGA-series list includes the corresponding products: M2a/M3 expansions, Premium Trainer Box MEGA, Start Deck 100 Battle Collection, and Starter Set MEGA.

The `SI` Galarian Articuno V printing is also directly identified by the official card database as `SI 169/414`, from Start Deck 100: [official Galarian Articuno V page](https://www.pokemon-card.com/card-search/details.php/card/40392/regu/all). The other SWSH, SM, SV, and XY set families are within the series explicitly allowed by the Extra rules page.

## Ban and deck-construction overlay

This report does not replace the existing [19 October dated banned-printing audit](../new-moon-lockbreak-japanese-print-audit.md). That audit's executable screen reports **zero explicitly listed banned-printing collisions** and distinguishes candidate Duskull S4 from prohibited Duskull SM11a, and candidate Unown XY (Farewell Letter) from prohibited Unown SM8 (DAMAGE/HAND). Official card pages confirm the candidate identities: [Duskull S4 043/100](https://www.pokemon-card.com/card-search/details.php/card/38541) and [Unown XY 046/171](https://www.pokemon-card.com/card-search/details.php/card/33598/).

The proposed 60 contains one Secret Box ACE SPEC and no Supporter from either of the Extra page's restricted name families (Professor's Research / Professor Oak's Research / Professor Sycamore, or Boss's Orders / Lysandre). The manifest remains exactly **19 Pokémon, 35 Trainers, 6 Energy = 60 cards**.

## What this closes — and what it does not

**Closed by this addendum:** event-date series admission for all 34 proposed Japanese print rows, including explicit MEGA-series product membership and pre-event release dates. The existing dated banned-printing screen remains a separate passing check.

**Not certified:** every card's latest errata and full Japanese paper text; any printed "not for official tournament" note; event-specific organizer exceptions; physical card possession/custody; actual paper payment/target/zone-transition correctness; or any paper-game acceptance. The proposed modified 60 is not an authenticated registered tournament list, and the source deck remains outside the Aichi Top 32 benchmark.

No gameplay trial, simulator result, matchup result, or win-rate inference is added. The candidate remains a rejection-oriented, unqualified challenger; this result does not nominate it as the fixed best deck or change the project's zero-qualified-game / no-demonstrated-99.5% status.
