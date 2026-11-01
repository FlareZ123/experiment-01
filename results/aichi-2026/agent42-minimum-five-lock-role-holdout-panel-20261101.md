# Agent 42: five exact-source lists cover seven lock-role printings

**1 November 2026.** Deterministic original-60 inventory study, **no native games**. Data: `results/aichi-2026/full-decklists.json`, 29 published complete source lists. Matching is by explicit card name and rank; every selected card also has a registered English printing ID.

A minimal **five-list set-cover panel**, retaining the existing rank-6 and rank-11 benchmark anchors, is:

| Final rank | Source archetype | Printed role(s) present |
| --- | --- | --- |
| 2 | Vileplume Control | Stoutland BCR122, Vileplume AOR3, Budew ASC16 |
| 4 | Raichu/Electrode | Klefki SVI96 |
| 6 | Iron Thorns | Iron Thorns ex TWM77 |
| 10 | Regidrago | Wobbuffet PHF36, Budew ASC16 |
| 11 | Absol/Garbodor | Garbodor BKP57 |

Seven considered roles: Stoutland Supporter lock; Klefki Basic Ability lock; Iron Thorns ex Rule-Box Ability lock; Garbodor Tool-enabled Ability lock; Wobbuffet non-Psychic Ability lock; Budew attacking Item lock; Vileplume Ability Item lock. These are *presence labels* whose activation and exact paper interactions require separate verification.

The minimum size is five **for this explicitly scoped role set**: no authenticated single deck contains two of the five anchor families Stoutland, Klefki, Iron Thorns ex, Garbodor and Wobbuffet. Their complete holder ranks are respectively [2], [4,17], [6,24,29], [8,11,16,22], and [7,10,21]. Rank 2 also contains Vileplume and Budew, so the five selected lists cover all seven roles. Holding ranks 6 and 11 fixed, exactly **six** five-rank combinations cover these seven roles; [2,4,6,10,11] is a relevant option adding both a dominant Regidrago archetype and a Raichu build.

**Proposal:** Once the shared paper-prompt and two-seat policy profile is genuinely qualified, add original ranks 2, 4 and 10 as distinct untouched source-rank stress tests alongside 6 and 11. Preserve each original 60, both physical seats, start-choice outcomes, all native errors and caps. This panel is a *mechanics-coverage screen*, not an estimate of 32-opponent aggregate performance, guarantee of lock execution, or substitute for other archetypes. Missing original ranks 23, 25 and 28 remain unknown.

**Field status:** 29/32 authentic complete opposing sixties, zero competitively qualified games, no validated 99.5% fixed deck.


## Natural accepted-opening availability limits

Exact source printing/stage census gives **14 Basic Pokémon at rank2**, **13 at rank4**, **four at rank6**, and **15 at rank10**. These counts include XYP67 Jirachi (Basic), LOT154 Ditto Prism Star (Basic), and the other registered Basic printings; they exclude VSTAR or Stage 1/2 cards. Given an ordinary uniformly random seven-card initial hand accepted only when it contains at least one Basic, the probability it contains at least one of a specified group of `L` direct lock Basics from a deck with `B` Basics is

`P = [1 - C(60-L,7)/C(60,7)] / [1 - C(60-B,7)/C(60,7)]`.

| Original source | Lock Basics in opening-seven event | Conditional chance | Independent accepted deals for 95% chance of at least one |
| --- | --- | ---: | ---: |
| rank2, B=14 | 1 Budew | **13.543697%** | **21** |
| rank4, B=13 | 1 Klefki | **13.936073%** | **20** |
| rank6, B=4 | 4 Iron Thorns ex | **100%** | **1** |
| rank10, B=15 | 1 Wobbuffet | **13.220031%** | **22** |
| rank10, B=15 | 1 Wobbuffet or 2 Budew | **35.742760%** | **7** |

All computations use exact integer combinations; the 95% targets assume **independent** accepted physical opening hands, with `n = ceil(log(0.05)/log(1-P))` and the deterministic rank6 case defined as one. Pairing two candidate lists on the same underlying source deal does **not** create two independent source-openers. For four independent opens, the chance of seeing no rank4 starting Klefki at all is **54.863641%** and of seeing no rank10 starting Wobbuffet is **56.712392%**. Thus a small proposed 4-seed panel will frequently miss actual starter locks despite mechanically covering their decklists.

These events establish **initial hand card presence**, not an automatically chosen Active starter, an attack or Ability activated, or a qualified opponent response. Searches, draw effects, Prize placement after the initial seven, opposing mulligans, the player's chosen Active and later turns are intentionally excluded. Rank11 Garbodor is an Evolution and its presence needs a separate legal-evolution/Boost Shake sequence, so an opening Basic count cannot certify its lock. The exact numeric targets guide practical source-dealt exposure design; staged mechanics fixtures remain separate.

